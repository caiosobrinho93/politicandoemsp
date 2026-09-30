# supabase/

Esta pasta guardará tudo relacionado ao banco de dados (FASE 02 em diante):

```
supabase/
├─ migrations/   # migrações SQL versionadas (uma por tarefa da FASE 02)
├─ policies/     # políticas de RLS por tabela, quando mantidas fora das migrações
└─ seed/         # dados estruturais (somente catálogos oficiais: partidos, fontes, cargos)
```

## Como aplicar

As migrações são SQL padrão e rodam tanto no Supabase quanto em um PostgreSQL
local. As extensões são instaladas no schema `extensions`, que é onde o Supabase
as mantém — por isso o mesmo arquivo funciona nos dois ambientes.

```bash
# cluster PostgreSQL local (sem Docker), na porta 55432
npm run db:local:start

# aplicar migrações (--seed inclui supabase/seed)
npm run db:apply
npm run db:apply:seed

# regerar src/types/database.types.ts a partir do schema
npm run db:types

# consultas de fumaça + teste de RLS por papel
npm run db:test

# recria o cluster do zero e roda tudo
npm run db:reset-local
```

Apontar para um projeto Supabase real é só definir `DATABASE_URL`
(ou `SUPABASE_DB_URL`) em `ambiente/.env.local`. Nunca aplique
`scripts/db/local-supabase-stub.sql` em um projeto Supabase: ele existe apenas
para recriar localmente o schema `auth` e os papéis `anon` / `authenticated` /
`service_role` que a plataforma já fornece.

## Regras

1. **Nenhum dado político é inserido por seed.** Seeds servem apenas para catálogos oficiais
   (partidos registrados, fontes, tipos de cargo/projeto). Qualquer dado factual precisa vir de
   coleta com fonte (`sources`), feita nas fases 04–07.
2. **Toda tabela factual referencia `sources`.** Sem fonte não há publicação.
3. **RLS ativa em todas as tabelas.** Leitura pública apenas de conteúdo verificado; escrita
   restrita a `moderator`/`admin`; `service_role` nunca exposta ao cliente.
4. **Toda alteração relevante gera registro em `audit_logs`** (autor, antes, depois, motivo).
5. **Migrações são incrementais e nomeadas por tarefa** (ex.: `0002_politicians.sql`), para permitir
   restaurar versões anteriores de registros.

Enquanto a FASE 02 estiver em vigor, esta pasta é apenas um marcador de escopo: não há cliente
Supabase nem variáveis obrigatórias, e a aplicação roda com as áreas de dados vazias.
