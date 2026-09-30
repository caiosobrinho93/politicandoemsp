-- =============================================================================
-- 0005 — Mandatos (tarefa 2.4)
-- =============================================================================

create table public.mandates (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians (id) on delete cascade,
  office public.political_office not null,
  level public.federative_level not null,
  -- Órgão/legislatura onde o mandato foi exercido, conforme a fonte.
  institution text not null,
  state text,
  city text,
  started_at date not null,
  -- NULL significa "mandato em curso ou fim não informado pela fonte".
  -- A plataforma não estima data de término (R0.9).
  ended_at date,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mandates_institution_not_blank check (btrim(institution) <> ''),
  constraint mandates_state_format check (state is null or state ~ '^[A-Z]{2}$'),
  constraint mandates_period_order check (ended_at is null or ended_at >= started_at),
  constraint mandates_level_coherent check (
    (
      level = 'federal'
      and office in ('presidente', 'senador', 'deputado_federal')
    )
    or (
      level = 'estadual'
      and office in ('governador', 'deputado_estadual', 'deputado_distrital')
    )
    or (
      level = 'municipal'
      and office in ('prefeito', 'vice_prefeito', 'vereador')
    )
  ),
  constraint mandates_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.mandates is
  'Períodos de exercício de cargo, cada um com fonte própria. Um político pode ter vários.';

create unique index mandates_unique_period
  on public.mandates (politician_id, office, institution, started_at);

create index mandates_politician_idx on public.mandates (politician_id, started_at desc);
create index mandates_institution_idx on public.mandates (institution, office);

create trigger mandates_set_updated_at
  before update on public.mandates
  for each row execute function public.set_updated_at();

create trigger mandates_require_source
  before insert or update on public.mandates
  for each row execute function public.enforce_source_before_publish('mandate');
