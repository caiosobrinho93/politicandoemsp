-- =============================================================================
-- 0009 — Notícias e declarações (tarefa 2.9)
--
-- R0.5: notícia é relato de terceiro, nunca prova de fato. Por isso a origem é
-- registrada como `noticia`; quando o conteúdo é fala atribuída ao político, a
-- origem passa a `declaracao` — o CHECK abaixo obriga que o selo corresponda ao
-- tipo de conteúdo, impedindo rótulo errado.
--
-- Deduplicação: `canonical_url` é derivada por trigger de `original_url` e tem
-- índice único. Recoletar a mesma matéria deve ATUALIZAR a linha existente
-- (upsert), nunca duplicar.
-- =============================================================================

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  publisher text not null,
  original_url text not null,
  canonical_url text,
  published_at timestamptz not null,
  -- Resumo descritivo, sem adjetivos e sem juízo de valor (R0.10).
  summary text not null,
  category text not null,
  moderation_status public.moderation_status not null default 'pending',
  -- TRUE quando o conteúdo é fala/nota atribuída ao político (vira `declaracao`).
  is_statement boolean not null default false,
  evidence_kind public.evidence_kind not null default 'noticia',
  source_id uuid not null references public.sources (id) on delete restrict,
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_title_not_blank check (btrim(title) <> ''),
  constraint news_publisher_not_blank check (btrim(publisher) <> ''),
  constraint news_summary_not_blank check (btrim(summary) <> ''),
  constraint news_category_not_blank check (btrim(category) <> ''),
  constraint news_url_http check (original_url ~* '^https?://[^[:space:]]+$'),
  constraint news_evidence_kind_matches_content check (
    (is_statement and evidence_kind = 'declaracao')
    or (not is_statement and evidence_kind = 'noticia')
  )
);

comment on table public.news is
  'Matérias e declarações publicadas por terceiros. Sempre exibidas como NOTÍCIA ou DECLARAÇÃO (R0.5).';

create unique index news_canonical_url_unique on public.news (canonical_url);
create index news_published_idx on public.news (published_at desc);
create index news_moderation_idx on public.news (moderation_status, published_at desc);

create trigger news_set_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

create trigger news_canonicalize_url
  before insert or update of original_url on public.news
  for each row execute function public.set_canonical_url('original_url');

create trigger news_require_source
  before insert or update on public.news
  for each row execute function public.enforce_source_before_publish('self');

-- -----------------------------------------------------------------------------
-- Políticos citados na matéria (domain.ts: `relatedPoliticianIds`).
-- `mention_role` descreve o papel do político NA MATÉRIA, conforme o veículo —
-- não é avaliação da plataforma.
-- -----------------------------------------------------------------------------
create table public.news_politicians (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.news (id) on delete cascade,
  politician_id uuid not null references public.politicians (id) on delete cascade,
  mention_role text not null default 'citado',
  created_at timestamptz not null default now(),
  constraint news_politicians_role_valid check (
    mention_role in ('citado', 'declarante', 'autor_declaracao')
  ),
  constraint news_politicians_unique unique (news_id, politician_id)
);

create index news_politicians_politician_idx
  on public.news_politicians (politician_id, news_id);
