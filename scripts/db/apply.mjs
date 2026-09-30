/**
 * Aplica as migrações da FASE 02 (e opcionalmente o seed) em um PostgreSQL.
 *
 * Uso:
 *   node scripts/db/apply.mjs                     # banco de .env.local (ou local)
 *   node scripts/db/apply.mjs --db-url=postgres://...
 *   node scripts/db/apply.mjs --seed              # aplica migrations + seed
 *   node scripts/db/apply.mjs --seed-only
 *   node scripts/db/apply.mjs --fresh             # recria o schema public (destrutivo)
 *
 * Registro: `supabase_migrations.applied_migrations` guarda nome + checksum.
 * Se um arquivo já aplicado mudar de conteúdo, o script PARA e aponta o conflito
 * (evita divergência silenciosa entre banco e repositório).
 */
import { Client } from 'pg'
import { MIGRATIONS_DIR, SEED_DIR, isLocalDbUrl, maskDbUrl, readCliFlags, resolveDbUrl } from './lib/env.mjs'
import { formatDuration, listSqlFiles } from './lib/sql.mjs'

const flags = readCliFlags()
const { url, source } = resolveDbUrl()
const useSeed = Boolean(flags.seed || flags['seed-only'])
const onlySeed = Boolean(flags['seed-only'])
const fresh = Boolean(flags.fresh)

const TRACKING_DDL = `
  create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.applied_migrations (
    version text primary key,
    name text not null,
    checksum text not null,
    applied_at timestamptz not null default now()
  );
`

async function main() {
  const client = new Client({
    connectionString: url,
    ssl: isLocalDbUrl(url) ? false : { rejectUnauthorized: false },
  })

  console.log(`Banco: ${maskDbUrl(url)}  (origem: ${source})`)
  await client.connect()

  try {
    if (fresh) {
      if (!isLocalDbUrl(url) && !flags.force) {
        throw new Error(
          '--fresh apaga dados. Use --force explicitamente para bancos não locais.',
        )
      }
      console.log('--fresh: apagando schema public e o registro de migrações...')
      await client.query('drop schema if exists public cascade; create schema public;')
      await client.query('drop schema if exists supabase_migrations cascade;')
    }

    await client.query(TRACKING_DDL)

    if (!onlySeed) {
      await applyMigrations(client)
    } else {
      console.log('--seed-only: migrações ignoradas.')
    }

    if (useSeed) {
      await applySeeds(client)
    }
  } finally {
    await client.end()
  }
}

async function applyMigrations(client) {
  const files = listSqlFiles(MIGRATIONS_DIR)
  if (files.length === 0) throw new Error(`Nenhuma migração encontrada em ${MIGRATIONS_DIR}`)

  const { rows } = await client.query(
    'select version, checksum from supabase_migrations.applied_migrations',
  )
  const applied = new Map(rows.map((row) => [row.version, row.checksum]))

  let executed = 0
  for (const file of files) {
    const version = file.name.slice(0, 4)
    const previousChecksum = applied.get(version)

    if (previousChecksum === file.checksum) {
      console.log(`  = ${file.name} (já aplicada)`)
      continue
    }

    if (previousChecksum && previousChecksum !== file.checksum) {
      throw new Error(
        `A migração ${file.name} mudou depois de aplicada.\n` +
          `  banco:      ${previousChecksum}\n` +
          `  arquivo:    ${file.checksum}\n` +
          'Crie uma nova migração em vez de editar uma já aplicada.',
      )
    }

    const startedAt = Date.now()
    await client.query('begin')
    try {
      await client.query(file.sql)
      await client.query(
        `insert into supabase_migrations.applied_migrations (version, name, checksum)
         values ($1, $2, $3)`,
        [version, file.name, file.checksum],
      )
      await client.query('commit')
    } catch (error) {
      await client.query('rollback')
      throw new Error(`Falha na migração ${file.name}: ${error.message}`)
    }

    executed += 1
    console.log(`  + ${file.name} (${formatDuration(startedAt)})`)
  }

  console.log(
    executed === 0
      ? 'Migrações: banco já estava atualizado.'
      : `Migrações: ${executed} aplicada(s) de ${files.length}.`,
  )
}

async function applySeeds(client) {
  const files = listSqlFiles(SEED_DIR)
  if (files.length === 0) {
    console.log('Seed: nenhum arquivo encontrado.')
    return
  }

  for (const file of files) {
    const startedAt = Date.now()
    await client.query('begin')
    try {
      await client.query(file.sql)
      await client.query('commit')
    } catch (error) {
      await client.query('rollback')
      throw new Error(`Falha no seed ${file.name}: ${error.message}`)
    }
    console.log(`  + seed/${file.name} (${formatDuration(startedAt)})`)
  }

  console.log(`Seed: ${files.length} arquivo(s) aplicado(s).`)
}

main().catch((error) => {
  console.error(`\nERRO: ${error.message}`)
  process.exitCode = 1
})
