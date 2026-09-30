-- =============================================================================
-- 0006 — Projetos e autoria (tarefa 2.5)
--
-- `summary` guarda a ementa com a redação oficial. A plataforma não reescreve,
-- não resume com opinião e não classifica o projeto como bom ou ruim (R0.10).
-- =============================================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  kind public.project_kind not null,
  -- Identificação oficial (tipo + número + ano), como a casa legislativa publica.
  official_code text,
  title text not null,
  -- Ementa/resumo conforme redação oficial da fonte.
  summary text not null,
  status public.project_status not null default 'apresentado',
  presented_at date not null,
  -- Data da última mudança de situação registrada com fonte.
  status_updated_at date,
  -- Casa legislativa de origem; necessária para localizar o projeto na fonte.
  institution text not null,
  state text,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_title_not_blank check (btrim(title) <> ''),
  constraint projects_summary_not_blank check (btrim(summary) <> ''),
  constraint projects_institution_not_blank check (btrim(institution) <> ''),
  constraint projects_state_format check (state is null or state ~ '^[A-Z]{2}$'),
  constraint projects_dates_order check (
    status_updated_at is null or status_updated_at >= presented_at
  ),
  constraint projects_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.projects is
  'Projetos de lei e demais proposições, com ementa oficial e situação comprovada por fonte.';

-- Um mesmo projeto não pode ser cadastrado duas vezes na mesma casa.
create unique index projects_official_code_unique
  on public.projects (institution, official_code)
  where official_code is not null;

create index projects_status_idx on public.projects (status, presented_at desc);
create index projects_institution_idx on public.projects (institution, presented_at desc);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger projects_require_source
  before insert or update on public.projects
  for each row execute function public.enforce_source_before_publish('project');

-- -----------------------------------------------------------------------------
-- Autoria: um projeto pode ter vários autores (domain.ts: `authorIds`).
-- A ordem preserva a lista oficial de autoria publicada pela casa.
-- -----------------------------------------------------------------------------
create table public.project_authors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  politician_id uuid not null references public.politicians (id) on delete cascade,
  author_role text not null default 'autor',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint project_authors_role_valid check (author_role in ('autor', 'coautor')),
  constraint project_authors_position_positive check (position >= 0),
  constraint project_authors_unique unique (project_id, politician_id)
);

create index project_authors_politician_idx
  on public.project_authors (politician_id, project_id);
