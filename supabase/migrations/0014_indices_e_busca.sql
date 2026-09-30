-- =============================================================================
-- 0014 — Índices, busca textual e desempenho (tarefa 2.14)
--
-- Busca em português exige dois cuidados: acentos (unaccent) e erros de digitação
-- (pg_trgm). Os índices abaixo usam a MESMA expressão da função de busca, para
-- que o planejador consiga utilizá-los.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Fontes
-- -----------------------------------------------------------------------------
create index sources_canonical_idx on public.sources (canonical_url);
create index sources_official_idx on public.sources (official_source_id, collected_at desc);
create index entity_sources_entity_idx on public.entity_sources (entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- Políticos: busca por nome completo e nome público, sem acento e tolerante a erro
-- -----------------------------------------------------------------------------
create index politicians_full_name_trgm_idx
  on public.politicians
  using gin ((public.immutable_unaccent(lower(full_name))) extensions.gin_trgm_ops);

create index politicians_public_name_trgm_idx
  on public.politicians
  using gin ((public.immutable_unaccent(lower(public_name))) extensions.gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- Projetos e notícias: busca no título e na ementa/resumo
-- -----------------------------------------------------------------------------
create index projects_title_trgm_idx
  on public.projects
  using gin ((public.immutable_unaccent(lower(title))) extensions.gin_trgm_ops);

create index projects_summary_trgm_idx
  on public.projects
  using gin ((public.immutable_unaccent(lower(summary))) extensions.gin_trgm_ops);

create index news_title_trgm_idx
  on public.news
  using gin ((public.immutable_unaccent(lower(title))) extensions.gin_trgm_ops);

create index news_publisher_idx on public.news (publisher, published_at desc);

-- -----------------------------------------------------------------------------
-- Gastos e verbas: recortes mais usados na interface (por político e por período)
-- -----------------------------------------------------------------------------
create index expenses_paying_agency_idx on public.expenses (paying_agency);
create index public_funds_granting_idx on public.public_funds (granting_agency);

-- -----------------------------------------------------------------------------
-- Índices parciais para as pendências operacionais (fila de moderação e de
-- publicação): são consultas frequentes e sobre um subconjunto pequeno.
-- -----------------------------------------------------------------------------
create index comments_pending_idx
  on public.comments (created_at)
  where moderation_status = 'pending';

create index news_pending_idx
  on public.news (created_at)
  where verified is false;

create index reports_pending_idx
  on public.reports (created_at)
  where status = 'pending';

create index correction_suggestions_pending_idx
  on public.correction_suggestions (created_at)
  where status = 'pending';

create index politicians_pending_idx
  on public.politicians (created_at)
  where verified is false;

-- -----------------------------------------------------------------------------
-- Busca de políticos pela interface.
--
-- SECURITY INVOKER (padrão): a política de RLS de `politicians` continua valendo,
-- ou seja, esta função nunca expõe registro não publicado.
-- -----------------------------------------------------------------------------
create or replace function public.search_politicians(p_term text, p_limit integer default 20)
returns setof public.politicians
language sql
stable
parallel safe
as $$
  select p.*
  from public.politicians p
  where public.immutable_unaccent(lower(p.full_name))
          like '%' || public.immutable_unaccent(lower(btrim(p_term))) || '%'
     or public.immutable_unaccent(lower(coalesce(p.public_name, '')))
          like '%' || public.immutable_unaccent(lower(btrim(p_term))) || '%'
  order by p.full_name
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

comment on function public.search_politicians(text, integer) is
  'Busca por nome (com ou sem acento). Retorna apenas o que a RLS já permite ver.';
