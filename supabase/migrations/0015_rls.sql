-- =============================================================================
-- 0015 — Row Level Security (tarefa 2.15)
--
-- Modelo de acesso:
--   · anônimo (anon) e usuário comum (authenticated): LEITURA apenas de conteúdo
--     publicado/verificado — nunca de rascunho, nunca de conteúdo de outro usuário;
--   · moderator: pode ler tudo e publicar/moderar dados oficiais;
--   · admin: pode também excluir registros oficiais e gerenciar usuários;
--   · service_role (chave de serviço, uso exclusivo em servidor): ignora RLS.
--
-- Nenhuma política concede leitura de dado não verificado ao público: é assim que
-- a plataforma garante que nada apareça sem fonte revisada (R0.3/R0.9).
--
-- Observação: requer o schema `auth` do Supabase (auth.uid()).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Funções de apoio (SECURITY DEFINER para não recursar na própria RLS)
-- -----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.role from public.profiles p where p.id = auth.uid();
$$;

comment on function public.current_user_role() is
  'Papel do usuário autenticado (user/moderator/admin) ou NULL quando não há sessão.';

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_user_role() in ('moderator', 'admin'), false);
$$;

comment on function public.is_staff() is
  'TRUE para moderator ou admin. Base de todas as políticas de escrita de dado oficial.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

comment on function public.is_admin() is
  'TRUE apenas para admin. Usado para exclusões e gestão de papéis.';

-- Verifica, ignorando RLS, se a linha referenciada já está publicada.
-- Usado por tabelas-filhas (autoria, votos individuais, itens de ranking...).
create or replace function public.is_public_row(p_entity_type text, p_entity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case p_entity_type
    when 'politicians' then (select p.verified from public.politicians p where p.id = p_entity_id)
    when 'projects' then (select p.verified from public.projects p where p.id = p_entity_id)
    when 'vote_sessions' then (select s.verified from public.vote_sessions s where s.id = p_entity_id)
    when 'news' then (select n.verified from public.news n where n.id = p_entity_id)
    when 'expenses' then (select e.verified from public.expenses e where e.id = p_entity_id)
    when 'public_funds' then (select f.verified from public.public_funds f where f.id = p_entity_id)
    when 'lists' then (select l.is_public from public.lists l where l.id = p_entity_id)
    when 'ranking_snapshots' then (
      select not s.is_user_ranking from public.ranking_snapshots s where s.id = p_entity_id
    )
    else false
  end;
$$;

comment on function public.is_public_row(text, uuid) is
  'TRUE quando a linha pai já está publicada (verified/public). Ignora RLS de propósito.';

-- -----------------------------------------------------------------------------
-- Liga a RLS em todas as tabelas do domínio.
-- -----------------------------------------------------------------------------
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'parties',
    'politicians',
    'mandates',
    'projects',
    'project_authors',
    'vote_sessions',
    'vote_records',
    'expenses',
    'public_funds',
    'sources',
    'entity_sources',
    'news',
    'news_politicians',
    'timeline_events',
    'profiles',
    'favorites',
    'lists',
    'list_items',
    'comments',
    'ratings',
    'reports',
    'correction_suggestions',
    'ranking_definitions',
    'ranking_snapshots',
    'ranking_snapshot_sources',
    'ranking_entries',
    'audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', v_table);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Tabelas de dado oficial com coluna `verified`:
-- leitura pública do publicado; escrita para moderator/admin; exclusão só admin.
-- -----------------------------------------------------------------------------
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'parties',
    'politicians',
    'mandates',
    'projects',
    'vote_sessions',
    'expenses',
    'public_funds',
    'news',
    'timeline_events'
  ]
  loop
    execute format(
      $fmt$
      create policy %1$s_read_public on public.%1$I
        for select
        to anon, authenticated
        using (verified is true or public.is_staff())
      $fmt$,
      v_table
    );

    execute format(
      $fmt$
      create policy %1$s_write_staff on public.%1$I
        for insert
        to authenticated
        with check (public.is_staff())
      $fmt$,
      v_table
    );

    execute format(
      $fmt$
      create policy %1$s_update_staff on public.%1$I
        for update
        to authenticated
        using (public.is_staff())
        with check (public.is_staff())
      $fmt$,
      v_table
    );

    execute format(
      $fmt$
      create policy %1$s_delete_admin on public.%1$I
        for delete
        to authenticated
        using (public.is_admin())
      $fmt$,
      v_table
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Fontes: leitura pública apenas das verificadas (fonte não revisada não é
-- exibida como se fosse confiável).
-- -----------------------------------------------------------------------------
create policy sources_read_public on public.sources
  for select to anon, authenticated
  using (verified is true or public.is_staff());

create policy sources_insert_staff on public.sources
  for insert to authenticated with check (public.is_staff());

create policy sources_update_staff on public.sources
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy sources_delete_admin on public.sources
  for delete to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Vínculo entidade↔fonte: visível quando a fonte vinculada é pública.
-- -----------------------------------------------------------------------------
create policy entity_sources_read_public on public.entity_sources
  for select to anon, authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.sources s where s.id = source_id and s.verified)
  );

create policy entity_sources_insert_staff on public.entity_sources
  for insert to authenticated with check (public.is_staff());

create policy entity_sources_delete_staff on public.entity_sources
  for delete to authenticated using (public.is_staff());

-- -----------------------------------------------------------------------------
-- Autoria de projeto: visível quando o projeto está publicado.
-- -----------------------------------------------------------------------------
create policy project_authors_read_public on public.project_authors
  for select to anon, authenticated
  using (public.is_staff() or public.is_public_row('projects', project_id));

create policy project_authors_write_staff on public.project_authors
  for insert to authenticated with check (public.is_staff());

create policy project_authors_delete_staff on public.project_authors
  for delete to authenticated using (public.is_staff());

-- -----------------------------------------------------------------------------
-- Políticos citados em notícia: visível quando a notícia está publicada.
-- -----------------------------------------------------------------------------
create policy news_politicians_read_public on public.news_politicians
  for select to anon, authenticated
  using (public.is_staff() or public.is_public_row('news', news_id));

create policy news_politicians_write_staff on public.news_politicians
  for insert to authenticated with check (public.is_staff());

create policy news_politicians_delete_staff on public.news_politicians
  for delete to authenticated using (public.is_staff());

-- -----------------------------------------------------------------------------
-- Voto individual: publicado junto com a sessão (ou por fonte própria).
-- -----------------------------------------------------------------------------
create policy vote_records_read_public on public.vote_records
  for select to anon, authenticated
  using (
    verified is true
    or public.is_staff()
    or public.is_public_row('vote_sessions', vote_session_id)
  );

create policy vote_records_insert_staff on public.vote_records
  for insert to authenticated with check (public.is_staff());

create policy vote_records_update_staff on public.vote_records
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy vote_records_delete_staff on public.vote_records
  for delete to authenticated using (public.is_staff());

-- =============================================================================
-- Conteúdo de usuário (R0.8)
-- =============================================================================

-- Perfil: apelido e papel são públicos; e-mail nunca sai de auth.users.
create policy profiles_read_all on public.profiles
  for select to anon, authenticated using (true);

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and role = 'user'::public.user_role);

-- O usuário edita o próprio perfil, mas NÃO pode alterar o próprio papel:
-- o papel resultante precisa continuar igual ao papel atual (lido de forma segura).
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = coalesce(public.current_user_role(), 'user'::public.user_role)
  );

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy profiles_delete_admin on public.profiles
  for delete to authenticated using (public.is_admin());

-- Favoritos: dados privados do usuário.
create policy favorites_read_own on public.favorites
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

create policy favorites_insert_own on public.favorites
  for insert to authenticated with check (user_id = auth.uid());

create policy favorites_delete_own on public.favorites
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Listas: públicas quando o dono marcar como públicas.
create policy lists_read_visible on public.lists
  for select to anon, authenticated
  using (is_public or owner_id = auth.uid() or public.is_staff());

create policy lists_insert_own on public.lists
  for insert to authenticated with check (owner_id = auth.uid());

create policy lists_update_own on public.lists
  for update to authenticated
  using (owner_id = auth.uid() or public.is_staff())
  with check (owner_id = auth.uid() or public.is_staff());

create policy lists_delete_own on public.lists
  for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- Itens de lista: seguem a visibilidade da lista.
create policy list_items_read_visible on public.list_items
  for select to anon, authenticated
  using (
    public.is_staff()
    or public.is_public_row('lists', list_id)
    or exists (
      select 1 from public.lists l where l.id = list_id and l.owner_id = auth.uid()
    )
  );

create policy list_items_write_own on public.list_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.lists l where l.id = list_id and l.owner_id = auth.uid()
    )
    or public.is_staff()
  );

create policy list_items_delete_own on public.list_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.lists l where l.id = list_id and l.owner_id = auth.uid()
    )
    or public.is_staff()
  );

-- Comentários: só aparecem publicamente depois de aprovados na moderação.
create policy comments_read_visible on public.comments
  for select to anon, authenticated
  using (
    moderation_status = 'approved'
    or author_id = auth.uid()
    or public.is_staff()
  );

create policy comments_insert_self on public.comments
  for insert to authenticated
  with check (author_id = auth.uid() and moderation_status = 'pending');

-- Autor edita enquanto o comentário não está publicado. Editar um comentário
-- reprovado o devolve para a fila. Comentário publicado não é editável pelo
-- autor — evita alterar texto já moderado (FASE 11 define o fluxo de correção).
create policy comments_update_self on public.comments
  for update to authenticated
  using (author_id = auth.uid() and moderation_status in ('pending', 'rejected'))
  with check (author_id = auth.uid() and moderation_status = 'pending');

create policy comments_moderate_staff on public.comments
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy comments_delete_own on public.comments
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- Avaliações: opinião pública, identificada pelo autor, sem vínculo com dado oficial.
create policy ratings_read_all on public.ratings
  for select to anon, authenticated using (true);

create policy ratings_insert_self on public.ratings
  for insert to authenticated with check (author_id = auth.uid());

create policy ratings_update_self on public.ratings
  for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy ratings_delete_self on public.ratings
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- Denúncias: quem denuncia vê a própria denúncia; a equipe vê todas.
create policy reports_read_own on public.reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_staff());

create policy reports_insert_self on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

create policy reports_resolve_staff on public.reports
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy reports_delete_admin on public.reports
  for delete to authenticated using (public.is_admin());

-- Sugestões de correção: quem sugeriu acompanha; a equipe decide.
create policy correction_suggestions_read_own on public.correction_suggestions
  for select to authenticated
  using (submitted_by = auth.uid() or public.is_staff());

create policy correction_suggestions_insert_self on public.correction_suggestions
  for insert to authenticated with check (submitted_by = auth.uid());

create policy correction_suggestions_review_staff on public.correction_suggestions
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy correction_suggestions_delete_admin on public.correction_suggestions
  for delete to authenticated using (public.is_admin());

-- =============================================================================
-- Rankings (R0.7/R0.8)
-- =============================================================================

-- A definição metodológica é pública: qualquer cidadão precisa poder auditar o critério.
create policy ranking_definitions_read_all on public.ranking_definitions
  for select to anon, authenticated using (true);

create policy ranking_definitions_insert_staff on public.ranking_definitions
  for insert to authenticated with check (public.is_staff());

create policy ranking_definitions_update_staff on public.ranking_definitions
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy ranking_definitions_delete_admin on public.ranking_definitions
  for delete to authenticated using (public.is_admin());

-- Snapshot objetivo é público; ranking de usuário é visível apenas ao autor (e à equipe).
create policy ranking_snapshots_read_visible on public.ranking_snapshots
  for select to anon, authenticated
  using (not is_user_ranking or created_by = auth.uid() or public.is_staff());

create policy ranking_snapshots_insert_staff on public.ranking_snapshots
  for insert to authenticated with check (public.is_staff());

create policy ranking_snapshots_insert_own on public.ranking_snapshots
  for insert to authenticated
  with check (is_user_ranking and created_by = auth.uid());

-- O autor mantém a marcação: não é possível transformar ranking de usuário em
-- ranking objetivo (o check exige is_user_ranking = true).
create policy ranking_snapshots_update_own on public.ranking_snapshots
  for update to authenticated
  using (is_user_ranking and created_by = auth.uid())
  with check (is_user_ranking and created_by = auth.uid());

create policy ranking_snapshots_update_staff on public.ranking_snapshots
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy ranking_snapshots_delete_own on public.ranking_snapshots
  for delete to authenticated
  using ((is_user_ranking and created_by = auth.uid()) or public.is_admin());

-- Fontes e posições seguem a visibilidade do snapshot.
create policy ranking_snapshot_sources_read_visible on public.ranking_snapshot_sources
  for select to anon, authenticated
  using (
    public.is_staff()
    or public.is_public_row('ranking_snapshots', snapshot_id)
    or exists (
      select 1 from public.ranking_snapshots s
      where s.id = snapshot_id and s.created_by = auth.uid()
    )
  );

create policy ranking_snapshot_sources_write_staff on public.ranking_snapshot_sources
  for insert to authenticated
  with check (
    public.is_staff()
    or exists (
      select 1 from public.ranking_snapshots s
      where s.id = snapshot_id
        and s.is_user_ranking
        and s.created_by = auth.uid()
    )
  );

create policy ranking_entries_read_visible on public.ranking_entries
  for select to anon, authenticated
  using (
    public.is_staff()
    or public.is_public_row('ranking_snapshots', snapshot_id)
    or exists (
      select 1 from public.ranking_snapshots s
      where s.id = snapshot_id and s.created_by = auth.uid()
    )
  );

create policy ranking_entries_write_staff on public.ranking_entries
  for insert to authenticated
  with check (
    public.is_staff()
    or exists (
      select 1 from public.ranking_snapshots s
      where s.id = snapshot_id
        and s.is_user_ranking
        and s.created_by = auth.uid()
    )
  );

create policy ranking_entries_delete_staff on public.ranking_entries
  for delete to authenticated using (public.is_staff());

-- =============================================================================
-- Trilha de auditoria
--
-- Somente a equipe lê. Não existe política de INSERT/UPDATE/DELETE: a trilha é
-- gravada por trigger SECURITY DEFINER (audit_row_change) e não pode ser editada
-- nem apagada pela aplicação — nem por admin.
-- =============================================================================
create policy audit_logs_read_staff on public.audit_logs
  for select to authenticated using (public.is_staff());

-- =============================================================================
-- Privilégios (GRANT)
--
-- O privilégio abre a porta; a RLS decide quais LINHAS passam. Ambos são
-- necessários. Declarados aqui para que o schema funcione igualmente no
-- Supabase e em um PostgreSQL local usado para validação.
-- =============================================================================
grant usage on schema public to anon, authenticated, service_role;

-- `public.immutable_unaccent` (usada pela busca e pelos índices trigram) chama
-- `extensions.unaccent`. Sem `usage` no schema, uma consulta de busca feita pelo
-- papel `anon` falha com "permission denied for schema extensions" em vez de
-- simplesmente não encontrar o termo. No Supabase esse privilégio já existe;
-- declaramos aqui para que o schema funcione nos dois ambientes.
grant usage on schema extensions to anon, authenticated, service_role;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Comentários: o autor escreve apenas o texto.
--
-- As colunas de moderação são concedidas ao papel `authenticated` porque a
-- equipe também é `authenticated`; o que impede o autor de se auto-aprovar é a
-- política de RLS (`comments_update_self` exige status 'pending' no resultado).
-- -----------------------------------------------------------------------------
revoke insert, update on public.comments from authenticated;
grant insert (politician_id, author_id, body, evidence_kind) on public.comments to authenticated;
grant update (body, moderation_status, moderated_by, moderated_at) on public.comments to authenticated;

-- -----------------------------------------------------------------------------
-- Avaliações: o autor escreve nota e justificativa, nada além disso.
-- -----------------------------------------------------------------------------
revoke insert, update on public.ratings from authenticated;
grant insert (politician_id, author_id, score, rationale, evidence_kind) on public.ratings to authenticated;
grant update (score, rationale) on public.ratings to authenticated;

-- -----------------------------------------------------------------------------
-- Perfil: o usuário não pode conceder a si mesmo privilégio de moderação, nem
-- editar colunas que não sejam de apresentação.
-- -----------------------------------------------------------------------------
revoke insert, update on public.profiles from authenticated;
grant insert (id, display_name) on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;





