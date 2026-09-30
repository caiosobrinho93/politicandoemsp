-- =============================================================================
-- 0007 — Votações e posições individuais (tarefa 2.6)
--
-- Votação (sessão) e voto individual são registros distintos: a sessão descreve
-- o que foi votado; o voto individual descreve a posição de um político.
-- =============================================================================

create table public.vote_sessions (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  description text not null,
  occurred_at date not null,
  project_id uuid references public.projects (id) on delete set null,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vote_sessions_institution_not_blank check (btrim(institution) <> ''),
  constraint vote_sessions_description_not_blank check (btrim(description) <> ''),
  constraint vote_sessions_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.vote_sessions is
  'Sessões de votação. `description` usa a descrição oficial da pauta, sem interpretação.';

create index vote_sessions_occurred_idx on public.vote_sessions (occurred_at desc);
create index vote_sessions_project_idx on public.vote_sessions (project_id);

create trigger vote_sessions_set_updated_at
  before update on public.vote_sessions
  for each row execute function public.set_updated_at();

create trigger vote_sessions_require_source
  before insert or update on public.vote_sessions
  for each row execute function public.enforce_source_before_publish('vote_session');

-- -----------------------------------------------------------------------------
-- Posição individual de voto.
--
-- `verified` é opcional aqui porque, por padrão, a publicação do voto segue a
-- publicação da sessão (ver política de leitura na migração 0015). O campo
-- existe para o caso de o voto individual ter fonte própria.
-- -----------------------------------------------------------------------------
create table public.vote_records (
  id uuid primary key default gen_random_uuid(),
  vote_session_id uuid not null references public.vote_sessions (id) on delete cascade,
  politician_id uuid not null references public.politicians (id) on delete cascade,
  position public.vote_position not null,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vote_records_unique_per_session unique (vote_session_id, politician_id),
  constraint vote_records_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.vote_records is
  'Posição de cada político em cada votação. Ausência de registro significa "não coletado".';

create index vote_records_politician_idx on public.vote_records (politician_id);
create index vote_records_position_idx on public.vote_records (vote_session_id, position);

create trigger vote_records_set_updated_at
  before update on public.vote_records
  for each row execute function public.set_updated_at();

create trigger vote_records_require_source
  before insert or update on public.vote_records
  for each row execute function public.enforce_source_before_publish('vote_record');
