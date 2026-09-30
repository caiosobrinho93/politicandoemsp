-- =============================================================================
-- 0013 — Trilha de auditoria (tarefa 2.13)
--
-- Toda alteração em dado oficial é registrada com autor, papel, estado anterior
-- e estado posterior. Isso é o que permite restaurar versões anteriores na
-- FASE 12 e saber quem alterou o quê.
--
-- A tabela é somente-escrita por trigger (SECURITY DEFINER) e somente-leitura
-- para a equipe: não há política de INSERT para usuários (ver 0015).
-- =============================================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_role public.user_role,
  action public.audit_action not null,
  entity_type text not null,
  entity_id uuid,
  -- Estado anterior e posterior completos, em JSON, para restauração.
  previous_value jsonb,
  new_value jsonb,
  -- Justificativa obrigatória em decisões de moderação (FASE 11).
  reason text,
  created_at timestamptz not null default now(),
  constraint audit_logs_entity_type_not_blank check (btrim(entity_type) <> ''),
  -- Insert/update/delete exigem os dois estados para permitir comparação.
  constraint audit_logs_values_present check (
    action not in ('insert', 'update', 'delete')
    or previous_value is not null
    or new_value is not null
  )
);

comment on table public.audit_logs is
  'Histórico imutável de alterações: quem mudou, quando, de qual valor para qual valor.';
comment on column public.audit_logs.previous_value is
  'Estado anterior completo da linha. Usado para restaurar versões (FASE 12).';

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Função genérica de auditoria.
--
-- SECURITY DEFINER: o registro da trilha não pode depender da permissão de quem
-- alterou o dado. `search_path` fixo para evitar sequestro de caminho.
-- -----------------------------------------------------------------------------
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid;
  v_role public.user_role;
  v_row jsonb;
  v_entity_id uuid;
begin
  -- auth.uid() existe no Supabase; fora dele retorna NULL e a trilha fica sem autor.
  begin
    v_actor := auth.uid();
  exception
    when others then
      v_actor := null;
  end;

  if v_actor is not null then
    select p.role into v_role from public.profiles p where p.id = v_actor;
  end if;

  if tg_op = 'DELETE' then
    v_row := to_jsonb(old);
  else
    v_row := to_jsonb(new);
  end if;

  v_entity_id := nullif(v_row ->> 'id', '')::uuid;

  insert into public.audit_logs (
    actor_id,
    actor_role,
    action,
    entity_type,
    entity_id,
    previous_value,
    new_value
  )
  values (
    v_actor,
    v_role,
    case tg_op
      when 'INSERT' then 'insert'::public.audit_action
      when 'UPDATE' then 'update'::public.audit_action
      else 'delete'::public.audit_action
    end,
    tg_table_name,
    v_entity_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );

  return null;
end;
$$;

comment on function public.audit_row_change() is
  'Trigger AFTER INSERT/UPDATE/DELETE: grava o antes e o depois em audit_logs.';

-- -----------------------------------------------------------------------------
-- Aplicação da trilha nas tabelas de dado factual.
--
-- Tabelas de conteúdo de usuário NÃO entram aqui: moderação de comentário é
-- registrada em audit_logs com action = 'moderate' pelo fluxo da FASE 11.
-- -----------------------------------------------------------------------------
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'parties',
    'politicians',
    'mandates',
    'projects',
    'vote_sessions',
    'vote_records',
    'expenses',
    'public_funds',
    'news',
    'timeline_events',
    'sources',
    'entity_sources',
    'ranking_definitions',
    'ranking_snapshots',
    'ranking_entries'
  ]
  loop
    execute format(
      'create trigger %I_audit after insert or update or delete on public.%I
         for each row execute function public.audit_row_change()',
      v_table,
      v_table
    );
  end loop;
end;
$$;
