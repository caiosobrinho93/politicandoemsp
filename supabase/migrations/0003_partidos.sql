-- =============================================================================
-- 0003 — Partidos (tarefa 2.2)
--
-- Nenhum partido é inserido por esta migração: sigla, nome e número de registro
-- são dados factuais e só entram pela coleta com fonte (TSE) na FASE 04 (R0.1).
-- =============================================================================

create table public.parties (
  id uuid primary key default gen_random_uuid(),
  -- Sigla oficial conforme registro eleitoral (valor vem da fonte).
  acronym text not null,
  name text not null,
  -- Número de registro no TSE, quando publicado pela fonte; NULL quando não
  -- coletado — nunca preenchido com valor estimado (R0.9).
  tse_number text,
  -- Selo de origem (R0.4): partido é registro de órgão público.
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parties_acronym_not_blank check (btrim(acronym) <> ''),
  constraint parties_acronym_format check (acronym ~ '^[A-Z0-9]{2,20}$'),
  constraint parties_name_not_blank check (btrim(name) <> ''),
  constraint parties_tse_number_format check (tse_number is null or tse_number ~ '^[0-9]{1,3}$'),
  constraint parties_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.parties is
  'Partidos com sigla/nome conforme registro eleitoral. Sigla é derivada da fonte, não digitada livremente.';

create unique index parties_acronym_unique on public.parties (upper(acronym));

create trigger parties_set_updated_at
  before update on public.parties
  for each row execute function public.set_updated_at();

create trigger parties_require_source
  before insert or update on public.parties
  for each row execute function public.enforce_source_before_publish('party');
