-- =============================================================================
-- Stub local do ambiente Supabase — NÃO é parte do schema do projeto.
--
-- Por que existe: as migrações do projeto dependem de duas coisas que TODO
-- projeto Supabase já traz de fábrica — o schema `auth` (com auth.uid()) e os
-- papéis `anon` / `authenticated` / `service_role`. Um PostgreSQL "puro" não tem
-- nada disso. Este arquivo cria o mínimo para validar as migrações e a RLS
-- localmente (sem Docker e sem tocar em nenhum projeto Supabase).
--
-- Aplicado automaticamente por `npm run db:local:start`.
-- NUNCA deve ser aplicado em um projeto Supabase real.
-- =============================================================================

create schema if not exists auth;

comment on schema auth is
  'Stub local (scripts/db/local-supabase-stub.sql). No Supabase real, é gerenciado pela plataforma.';

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now()
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.role', true), '');
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;

  -- No Supabase, service_role ignora RLS. O stub replica esse comportamento.
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant execute on function auth.role() to anon, authenticated, service_role;
grant select on auth.users to service_role;
