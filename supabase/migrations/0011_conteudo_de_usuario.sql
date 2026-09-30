-- =============================================================================
-- 0011 — Conteúdo de usuário (tarefa 2.11)
--
-- R0.8: conteúdo de usuário nunca se mistura a dado oficial. Isso é garantido
-- estruturalmente: tudo aqui vive em tabelas próprias, referencia `profiles` e
-- carrega o selo `opiniao`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Perfil público. Ligado a `auth.users` (Supabase Auth); o e-mail continua
-- somente em `auth.users` e nunca é exposto nas consultas públicas.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(btrim(display_name)) between 2 and 60)
);

comment on table public.profiles is
  'Perfil público do usuário. Não contém dado sensível: e-mail permanece em auth.users.';
comment on column public.profiles.role is
  'Papel do usuário. Somente admin altera papel (política de UPDATE na migração 0015).';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Favoritos
-- -----------------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  politician_id uuid not null references public.politicians (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_unique unique (user_id, politician_id)
);

create index favorites_user_idx on public.favorites (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Listas personalizadas
-- -----------------------------------------------------------------------------
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lists_name_length check (char_length(btrim(name)) between 1 and 80)
);

comment on table public.lists is
  'Listas criadas por usuários. Mesmo públicas, são sempre exibidas como OPINIÃO DO USUÁRIO (R0.8).';

create index lists_owner_idx on public.lists (owner_id, created_at desc);

create trigger lists_set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();

create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists (id) on delete cascade,
  politician_id uuid not null references public.politicians (id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  constraint list_items_position_positive check (position >= 0),
  constraint list_items_unique_politician unique (list_id, politician_id),
  constraint list_items_unique_position unique (list_id, position)
);

create index list_items_list_idx on public.list_items (list_id, position);

-- -----------------------------------------------------------------------------
-- Comentários (moderados; nunca exibidos como dado oficial)
--
-- `author_display_name` do tipo de domínio é obtido por JOIN em `profiles` no
-- momento da leitura — não é duplicado aqui, para que a troca de apelido pelo
-- usuário se reflita em todo o histórico.
-- -----------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  evidence_kind public.evidence_kind not null default 'opiniao',
  moderation_status public.moderation_status not null default 'pending',
  moderated_by uuid references public.profiles (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_body_length check (char_length(btrim(body)) between 1 and 2000),
  constraint comments_evidence_kind_fixed check (evidence_kind = 'opiniao')
);

comment on table public.comments is
  'Comentários de usuários. Só são visíveis publicamente após moderação (status approved).';

create index comments_politician_idx on public.comments (politician_id, created_at desc);
create index comments_moderation_idx on public.comments (moderation_status, created_at);
create index comments_author_idx on public.comments (author_id, created_at desc);

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Avaliações de usuário (nota de 1 a 5) — sempre opinião, nunca nota oficial.
-- -----------------------------------------------------------------------------
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  score smallint not null,
  rationale text,
  evidence_kind public.evidence_kind not null default 'opiniao',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ratings_score_range check (score between 1 and 5),
  constraint ratings_rationale_length check (
    rationale is null or char_length(rationale) <= 1000
  ),
  constraint ratings_evidence_kind_fixed check (evidence_kind = 'opiniao'),
  -- Uma avaliação por usuário por político: evita inflar a média.
  constraint ratings_unique_per_user unique (politician_id, author_id)
);

comment on table public.ratings is
  'Notas de 1 a 5 dadas por usuários. A plataforma nunca apresenta a média como dado oficial.';

create index ratings_politician_idx on public.ratings (politician_id);

create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Denúncias de conteúdo (moderação — FASE 11)
-- -----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type public.report_target_type not null,
  target_id uuid not null,
  reporter_id uuid references public.profiles (id) on delete set null,
  reason text not null,
  details text,
  -- Link que sustenta a denúncia ou a correção (R0.3), quando houver.
  source_url text,
  status public.moderation_status not null default 'pending',
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now(),
  constraint reports_reason_length check (char_length(btrim(reason)) between 1 and 300),
  constraint reports_source_url_http check (
    source_url is null or source_url ~* '^https?://[^[:space:]]+$'
  )
);

create index reports_status_idx on public.reports (status, created_at);
create index reports_target_idx on public.reports (target_type, target_id);

-- -----------------------------------------------------------------------------
-- Sugestões de correção de informação (FASE 10/11)
--
-- Regra R0.3 aplicada de forma dura: sem `source_url` não existe sugestão.
-- -----------------------------------------------------------------------------
create table public.correction_suggestions (
  id uuid primary key default gen_random_uuid(),
  entity_type public.correction_entity_type not null,
  entity_id uuid not null,
  field text not null,
  current_value text,
  suggested_value text not null,
  source_url text not null,
  submitted_by uuid references public.profiles (id) on delete set null,
  status public.moderation_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  constraint correction_suggestions_field_not_blank check (btrim(field) <> ''),
  constraint correction_suggestions_value_not_blank check (btrim(suggested_value) <> ''),
  constraint correction_suggestions_source_url_http check (
    source_url ~* '^https?://[^[:space:]]+$'
  )
);

comment on table public.correction_suggestions is
  'Pedidos de correção com link de fonte obrigatório: a plataforma corrige com base na fonte, não na opinião.';

create index correction_suggestions_entity_idx
  on public.correction_suggestions (entity_type, entity_id, status);
create index correction_suggestions_status_idx
  on public.correction_suggestions (status, created_at);

