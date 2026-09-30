-- =============================================================================
-- 0002 — Fontes (tarefa 2.8) e vínculo entidade↔fonte
--
-- `sources` é a tabela transversal do projeto: nenhum dado factual pode ser
-- publicado sem ao menos um registro aqui (R0.3). Cada linha guarda a URL
-- exata consultada e o instante da coleta.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger que preenche canonical_url (usado por `sources` e por `news`).
-- Precisa existir antes dos triggers que o referenciam.
-- -----------------------------------------------------------------------------
create or replace function public.set_canonical_url()
returns trigger
language plpgsql
as $$
declare
  v_row jsonb := to_jsonb(new);
  v_column text := coalesce(nullif(tg_argv[0], ''), 'url');
begin
  new.canonical_url := public.canonicalize_url(v_row ->> v_column);
  return new;
end;
$$;

comment on function public.set_canonical_url() is
  'Preenche a coluna canonical_url a partir da coluna informada em TG_ARGV[0].';

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  -- Chave estável do catálogo em src/config/sources.ts (ex.: 'alesp'). Não é FK
  -- porque o catálogo vive no código; serve para agrupar por instituição.
  official_source_id text,
  publisher text not null,
  url text not null,
  -- Derivado por trigger: agrupa a mesma página coletada em datas diferentes.
  canonical_url text,
  title text,
  -- URL de dados abertos/API quando a fonte disponibilizar (ver catálogo).
  data_url text,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  collected_at timestamptz not null,
  published_at timestamptz,
  -- Revisão humana da fonte. Sem revisão, o registro não é lido publicamente (2.15).
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sources_publisher_not_blank check (btrim(publisher) <> ''),
  constraint sources_url_not_blank check (btrim(url) <> ''),
  constraint sources_url_http check (url ~* '^https?://[^[:space:]]+$')
);

comment on table public.sources is
  'Fonte de cada informação exibida: instituição + URL exata + data de coleta (R0.3).';
comment on column public.sources.collected_at is
  'Instante em que a plataforma obteve o dado. Obrigatório e nunca estimado.';
comment on column public.sources.verified is
  'Revisão humana: somente fontes verificadas são legíveis publicamente.';

create trigger sources_set_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();

create trigger sources_canonicalize_url
  before insert or update of url on public.sources
  for each row execute function public.set_canonical_url();

-- -----------------------------------------------------------------------------
-- Vínculo polimórfico entidade ↔ fonte.
--
-- Entidades que possuem lista de referências (`sources: SourceRef[]`) usam esta
-- tabela. `expenses` e `news` têm uma única fonte e guardam `source_id` direto,
-- espelhando o tipo de domínio (`Expense.source`, `NewsArticle.source`).
-- -----------------------------------------------------------------------------
create table public.entity_sources (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  constraint entity_sources_type_valid check (
    entity_type in (
      'party',
      'politician',
      'mandate',
      'project',
      'vote_session',
      'vote_record',
      'public_fund',
      'timeline_event',
      'ranking_snapshot'
    )
  ),
  constraint entity_sources_unique unique (source_id, entity_type, entity_id)
);

comment on table public.entity_sources is
  'Ligações entre registros factuais e suas fontes. Necessária para publicar (verified).';

-- -----------------------------------------------------------------------------
-- Regra R0.3 aplicada pelo próprio banco: nada é marcado como publicado
-- (`verified = true`) sem fonte vinculada.
--
-- Fluxo obrigatório de cadastro: (1) inserir o registro (verified = false);
-- (2) vincular a fonte (entity_sources, ou source_id no próprio registro);
-- (3) marcar verified = true. Sem o passo 2 o banco recusa o passo 3.
-- -----------------------------------------------------------------------------
create or replace function public.enforce_source_before_publish()
returns trigger
language plpgsql
as $$
declare
  v_entity_type text := tg_argv[0];
  v_row jsonb := to_jsonb(new);
  v_has_source boolean;
begin
  if coalesce((v_row ->> 'verified')::boolean, false) is not true then
    return new;
  end if;

  if v_entity_type = 'self' then
    v_has_source := nullif(v_row ->> 'source_id', '') is not null;
  else
    select exists (
      select 1
      from public.entity_sources es
      where es.entity_type = v_entity_type
        and es.entity_id = (v_row ->> 'id')::uuid
    )
    into v_has_source;
  end if;

  if not v_has_source then
    raise exception
      'R0.3: % não pode ser publicado sem fonte registrada.', tg_table_name
      using errcode = 'check_violation',
            hint = 'Insira a fonte vinculada e só então marque verified = true.';
  end if;

  return new;
end;
$$;

comment on function public.enforce_source_before_publish() is
  'Impede published/verified sem fonte (R0.3). Recebe o entity_type em TG_ARGV[0].';
