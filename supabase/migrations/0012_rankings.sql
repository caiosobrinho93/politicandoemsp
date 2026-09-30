-- =============================================================================
-- 0012 — Rankings com metodologia e versionamento (tarefa 2.12)
--
-- R0.7: ranking existe somente com critério objetivo, recorte declarado
-- (cargo/esfera/período), metodologia publicada e fontes listadas. O banco não
-- tem como "opinar": ele apenas guarda o número calculado e de onde ele veio.
--
-- Ranking criado por usuário é um registro separado e explicitamente marcado
-- (`is_user_ranking`), e precisa de autor (R0.8).
--
-- Requer PostgreSQL 15+ (uso de `NULLS NOT DISTINCT`).
-- =============================================================================

create table public.ranking_definitions (
  id uuid primary key default gen_random_uuid(),
  metric public.ranking_metric not null,
  -- Direção explícita: "maior número" não significa "melhor" (R0.6/R0.10).
  direction public.ranking_direction not null,
  -- Recorte obrigatório de comparação: comparar cargos diferentes seria enganoso.
  office_scope public.political_office,
  state_scope text,
  period_start date not null,
  period_end date not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ranking_definitions_state_format check (
    state_scope is null or state_scope ~ '^[A-Z]{2}$'
  ),
  constraint ranking_definitions_period_order check (period_end >= period_start)
);

comment on table public.ranking_definitions is
  'Definição de ranking objetivo: métrica, direção, recorte de cargo/UF e período.';

create unique index ranking_definitions_unique_scope
  on public.ranking_definitions (
    metric,
    direction,
    office_scope,
    state_scope,
    period_start,
    period_end
  ) nulls not distinct;

create trigger ranking_definitions_set_updated_at
  before update on public.ranking_definitions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Snapshot: resultado versionado de uma definição, sempre com metodologia.
-- -----------------------------------------------------------------------------
create table public.ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  definition_id uuid not null references public.ranking_definitions (id) on delete cascade,
  -- Texto publicável que explica fórmula, período, fonte e limitações (R0.7).
  methodology text not null,
  computed_at timestamptz not null,
  created_by uuid references public.profiles (id) on delete set null,
  is_user_ranking boolean not null default false,
  created_at timestamptz not null default now(),
  constraint ranking_snapshots_methodology_not_blank check (btrim(methodology) <> ''),
  -- Ranking de usuário sem autor identificado não é aceito.
  constraint ranking_snapshots_user_ranking_requires_author check (
    not is_user_ranking or created_by is not null
  )
);

comment on table public.ranking_snapshots is
  'Resultado congelado de um ranking, com metodologia. Recalcular gera novo snapshot; o anterior é preservado.';

create index ranking_snapshots_definition_idx
  on public.ranking_snapshots (definition_id, computed_at desc);

create table public.ranking_snapshot_sources (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.ranking_snapshots (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint ranking_snapshot_sources_unique unique (snapshot_id, source_id)
);

create table public.ranking_entries (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.ranking_snapshots (id) on delete cascade,
  politician_id uuid not null references public.politicians (id) on delete cascade,
  position integer not null,
  -- Valor bruto da métrica, exatamente como calculado a partir da fonte.
  value numeric(18, 4) not null,
  created_at timestamptz not null default now(),
  constraint ranking_entries_position_positive check (position >= 1),
  constraint ranking_entries_unique_position unique (snapshot_id, position),
  constraint ranking_entries_unique_politician unique (snapshot_id, politician_id)
);

create index ranking_entries_politician_idx on public.ranking_entries (politician_id);
