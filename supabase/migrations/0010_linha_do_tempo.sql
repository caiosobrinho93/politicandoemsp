-- =============================================================================
-- 0010 — Linha do tempo (tarefa 2.10)
--
-- A linha do tempo reúne marcos objetivos da trajetória pública. Cada evento
-- existe isoladamente e precisa de fonte própria; nenhum evento é inferido a
-- partir de outro (R0.1).
-- =============================================================================

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians (id) on delete cascade,
  kind public.timeline_event_kind not null,
  title text not null,
  description text not null,
  occurred_at date not null,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timeline_events_title_not_blank check (btrim(title) <> ''),
  constraint timeline_events_description_not_blank check (btrim(description) <> ''),
  constraint timeline_events_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.timeline_events is
  'Marcos objetivos (eleição, posse, votação, decisão judicial...) com fonte e data do fato.';

create index timeline_events_politician_idx
  on public.timeline_events (politician_id, occurred_at desc);
create index timeline_events_kind_idx on public.timeline_events (kind, occurred_at desc);

create trigger timeline_events_set_updated_at
  before update on public.timeline_events
  for each row execute function public.set_updated_at();

create trigger timeline_events_require_source
  before insert or update on public.timeline_events
  for each row execute function public.enforce_source_before_publish('timeline_event');
