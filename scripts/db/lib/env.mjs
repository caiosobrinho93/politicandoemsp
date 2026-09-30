/**
 * Resolução de caminhos e da conexão de banco para os utilitários de banco.
 *
 * Usado apenas em desenvolvimento/validação (FASE 02). Nada aqui roda em
 * produção: a aplicação web fala com o Supabase pelo SDK (FASE 03+).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url))
export const MIGRATIONS_DIR = join(REPO_ROOT, 'supabase', 'migrations')
export const SEED_DIR = join(REPO_ROOT, 'supabase', 'seed')
export const TYPES_FILE = join(REPO_ROOT, 'src', 'types', 'database.types.ts')
export const LOCAL_STUB_FILE = join(REPO_ROOT, 'scripts', 'db', 'local-supabase-stub.sql')

/** Cluster PostgreSQL embarcado usado para validar as migrações sem Docker. */
export const LOCAL_DIR = join(REPO_ROOT, '.local')
export const LOCAL_DB_DIR = join(LOCAL_DIR, 'pgdata')
export const LOCAL_LOG_DIR = join(LOCAL_DIR, 'logs')
export const LOCAL_PORT = 55432
export const LOCAL_USER = 'postgres'
export const LOCAL_PASSWORD = 'postgres'
export const LOCAL_DATABASE = 'politicasp'
export const LOCAL_DB_URL = `postgres://${LOCAL_USER}:${LOCAL_PASSWORD}@127.0.0.1:${LOCAL_PORT}/${LOCAL_DATABASE}`

/** Lê `.env.local` sem dependência externa (chave=valor, # comentário). */
function readEnvLocal() {
  const file = join(REPO_ROOT, '.env.local')
  if (!existsSync(file)) return {}

  const entries = {}
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separator = line.indexOf('=')
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    entries[key] = value
  }
  return entries
}

export function readCliFlags(argv = process.argv.slice(2)) {
  const flags = { _: [] }
  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      flags._.push(arg)
      continue
    }
    const [key, rawValue] = arg.slice(2).split('=')
    flags[key] = rawValue === undefined ? true : rawValue
  }
  return flags
}

/**
 * Ordem de precedência:
 *   1. `--db-url=...`
 *   2. variável de ambiente SUPABASE_DB_URL ou DATABASE_URL
 *   3. `.env.local` (SUPABASE_DB_URL ou DATABASE_URL)
 *   4. cluster local embarcado (127.0.0.1:55432)
 */
export function resolveDbUrl(argv = process.argv.slice(2)) {
  const flags = readCliFlags(argv)
  const envLocal = readEnvLocal()

  const fromFlags = typeof flags['db-url'] === 'string' ? flags['db-url'] : undefined
  const url =
    fromFlags ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    envLocal.SUPABASE_DB_URL ||
    envLocal.DATABASE_URL ||
    LOCAL_DB_URL

  return { url, source: fromFlags ? '--db-url' : 'ambiente/.env.local (ou cluster local)' }
}

export function isLocalDbUrl(url) {
  return /@(127\.0\.0\.1|localhost|\[::1\]):/.test(url)
}

/** Oculta a senha antes de imprimir a URL no terminal. */
export function maskDbUrl(url) {
  return url.replace(/:\/\/([^:]+):([^@]*)@/, '://$1:***@')
}
