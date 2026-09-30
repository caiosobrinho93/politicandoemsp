-- =============================================================================
-- 0001 — Tipos base, extensões e funções auxiliares
-- FASE 02 · tipos usados por todas as tabelas · extensões (2.14) · URL canônica (2.9)
--
-- Regras do projeto refletidas neste arquivo:
--   R0.4 — a origem de cada informação é um tipo explícito (`evidence_kind`);
--   R0.7 — ranking declara métrica, direção e período no próprio schema;
--   R0.9 — ausência de dado é NULL (nunca 0, "N/A" ou valor estimado).
-- =============================================================================

-- Extensões: no Supabase elas ficam no schema `extensions` (já existente) e o
-- schema é criado aqui apenas para que a validação local use o mesmo arranjo.
-- `gen_random_uuid()` não exige extensão: é função nativa desde o PostgreSQL 13.
create schema if not exists extensions;

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- -----------------------------------------------------------------------------
-- Categorias de origem da informação (espelha src/lib/evidence.ts — R0.4)
-- -----------------------------------------------------------------------------
create type public.evidence_kind as enum (
  'fato',         -- acontecimento objetivo em documento público identificável
  'dado_oficial', -- número/registro produzido por órgão público
  'noticia',      -- relato de veículo de imprensa (terceiro — R0.5)
  'declaracao',   -- fala/nota atribuída ao político ou ao seu gabinete
  'opiniao'       -- avaliação de terceiro ou de usuário
);

-- -----------------------------------------------------------------------------
-- Cargos e esferas (espelha src/types/domain.ts)
-- -----------------------------------------------------------------------------
create type public.federative_level as enum ('federal', 'estadual', 'municipal');

create type public.political_office as enum (
  'presidente',
  'governador',
  'senador',
  'deputado_federal',
  'deputado_estadual',
  'deputado_distrital',
  'prefeito',
  'vice_prefeito',
  'vereador'
);

-- -----------------------------------------------------------------------------
-- Atuação legislativa
-- -----------------------------------------------------------------------------
create type public.project_kind as enum (
  'projeto_de_lei',
  'projeto_de_lei_complementar',
  'proposta_de_emenda_constitucional',
  'medida_provisoria',
  'requerimento',
  'indicacao',
  'outro'
);

create type public.project_status as enum (
  'apresentado',
  'em_tramitacao',
  'aprovado',
  'sancionado',
  'vetado',
  'arquivado',
  'executado',
  'entregue'
);

create type public.vote_position as enum (
  'sim',
  'nao',
  'abstencao',
  'ausente',
  'obstrucao'
);

-- -----------------------------------------------------------------------------
-- Gastos públicos, verbas e emendas
-- -----------------------------------------------------------------------------
create type public.expense_category as enum (
  'cota_parlamentar',
  'gabinete',
  'diarias',
  'passagens',
  'remuneracao',
  'outra'
);

create type public.public_fund_kind as enum (
  'emenda',
  'convenio',
  'contrato',
  'transferencia'
);

-- -----------------------------------------------------------------------------
-- Notícias e linha do tempo
-- -----------------------------------------------------------------------------
create type public.timeline_event_kind as enum (
  'eleicao',
  'posse',
  'projeto',
  'votacao',
  'nomeacao',
  'decisao_judicial',
  'outro'
);

-- -----------------------------------------------------------------------------
-- Conteúdo de usuário e moderação (R0.8)
-- -----------------------------------------------------------------------------
create type public.moderation_status as enum (
  'pending',
  'approved',
  'rejected',
  'hidden'
);

create type public.user_role as enum ('user', 'moderator', 'admin');

create type public.report_target_type as enum (
  'comment',
  'rating',
  'politician_data',
  'news'
);

create type public.correction_entity_type as enum (
  'politician',
  'mandate',
  'project',
  'vote',
  'expense',
  'public_fund'
);

-- -----------------------------------------------------------------------------
-- Rankings (R0.7)
-- -----------------------------------------------------------------------------
create type public.ranking_metric as enum (
  'projetos_apresentados',
  'projetos_aprovados',
  'participacao',
  'gastos',
  'emendas',
  'atividade_legislativa'
);

create type public.ranking_direction as enum ('desc', 'asc');

-- -----------------------------------------------------------------------------
-- Auditoria
-- -----------------------------------------------------------------------------
create type public.audit_action as enum (
  'insert',
  'update',
  'delete',
  'moderate',
  'login'
);

-- =============================================================================
-- Funções auxiliares
-- =============================================================================

-- Mantém `updated_at` coerente em qualquer tabela auditável.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger BEFORE UPDATE: registra o instante da última alteração da linha.';

-- -----------------------------------------------------------------------------
-- URL canônica para deduplicação de notícias (tarefa 2.9)
--
-- Regra: mesma matéria publicada com o mesmo caminho é o MESMO registro.
-- A função remove protocolo, "www.", parâmetros de rastreio, fragmento e barra
-- final; o domínio é normalizado para minúsculas. Determinística e imutável,
-- portanto pode ser usada em índice único.
-- -----------------------------------------------------------------------------
create or replace function public.canonicalize_url(p_url text)
returns text
language sql
immutable
parallel safe
as $$
  select case
    when p_url is null or btrim(p_url) = '' then null
    else rtrim(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            lower(btrim(p_url)),
            '^(https?|ftp)://',
            ''
          ),
          '^www\.',
          ''
        ),
        '[?#].*$',
        ''
      ),
      '/'
    )
  end;
$$;

comment on function public.canonicalize_url(text) is
  'Normaliza URL para deduplicação: remove esquema, www., query, fragmento e barra final.';

-- -----------------------------------------------------------------------------
-- `unaccent` não é imutável por padrão; o invólucro abaixo é imutável e por isso
-- pode ser usado em índices de busca textual (tarefa 2.14).
--
-- O dicionário é citado com o schema qualificado (`extensions`), e não pelo
-- search_path, para que a função resolva a mesma coisa em qualquer sessão.
-- -----------------------------------------------------------------------------
create or replace function public.immutable_unaccent(p_text text)
returns text
language sql
immutable
parallel safe
strict
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, p_text);
$$;

comment on function public.immutable_unaccent(text) is
  'Versão imutável de unaccent(), necessária para índices GIN trigram em nome de político.';

