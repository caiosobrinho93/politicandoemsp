-- =============================================================================
-- 0004 — Políticos (tarefa 2.3)
--
-- A tabela guarda apenas o que a fonte oficial publica. Campo sem coleta fica
-- NULL e a interface exibe "Não coletado" (R0.9) — nunca um valor de enfeite.
-- =============================================================================

create table public.politicians (
  id uuid primary key default gen_random_uuid(),
  -- Nome civil/completo conforme a fonte oficial.
  full_name text not null,
  -- Nome público, quando a própria fonte registra esse campo.
  public_name text,
  -- Foto publicada em fonte oficial; nunca imagem gerada ou ilustrativa.
  photo_url text,
  -- Fonte da foto, para que a origem da imagem também seja verificável.
  photo_source_id uuid references public.sources (id) on delete set null,
  office public.political_office,
  office_level public.federative_level,
  party_id uuid references public.parties (id) on delete set null,
  state text,
  city text,
  biography text,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint politicians_full_name_not_blank check (btrim(full_name) <> ''),
  constraint politicians_state_format check (state is null or state ~ '^[A-Z]{2}$'),
  constraint politicians_photo_url_http check (
    photo_url is null or photo_url ~* '^https?://[^[:space:]]+$'
  ),
  -- A esfera federativa é derivada do cargo; o banco recusa combinações
  -- inventadas (ex.: vereador marcado como federal).
  constraint politicians_office_level_coherent check (
    office is null
    or office_level is null
    or (
      office_level = 'federal'
      and office in ('presidente', 'senador', 'deputado_federal')
    )
    or (
      office_level = 'estadual'
      and office in ('governador', 'deputado_estadual', 'deputado_distrital')
    )
    or (
      office_level = 'municipal'
      and office in ('prefeito', 'vice_prefeito', 'vereador')
    )
  ),
  -- Cargo municipal exige município identificado: sem ele o dado não é
  -- interpretável e a plataforma não adivinha.
  constraint politicians_municipal_requires_city check (
    office_level is distinct from 'municipal' or city is not null
  ),
  constraint politicians_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.politicians is
  'Pessoas públicas com cargo comprovado por fonte oficial. Sem fonte não é publicado (R0.3).';
comment on column public.politicians.biography is
  'Texto somente com informação pública citável; sem adjetivos valorativos (R0.10).';
comment on column public.politicians.office is
  'Cargo atual ou mais recente comprovado por fonte. NÃO é previsão nem intenção de candidatura.';

create index politicians_full_name_idx on public.politicians (full_name);
create index politicians_party_idx on public.politicians (party_id);
create index politicians_office_idx on public.politicians (office_level, office);
create index politicians_state_idx on public.politicians (state);
create index politicians_verified_idx on public.politicians (verified);

create trigger politicians_set_updated_at
  before update on public.politicians
  for each row execute function public.set_updated_at();

create trigger politicians_require_source
  before insert or update on public.politicians
  for each row execute function public.enforce_source_before_publish('politician');
