/**
 * Cluster PostgreSQL local para validar as migrações sem Docker.
 *
 *   npm run db:local:start   # inicializa (se preciso), sobe e prepara o stub
 *   npm run db:local:status
 *   npm run db:local:stop
 *   npm run db:local:reset   # apaga os dados locais e recria do zero
 *
 * O cluster fica em `.local/pgdata` (ignorado pelo git) na porta 55432 e NÃO tem
 * nenhuma relação com o projeto Supabase de produção.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import EmbeddedPostgres from 'embedded-postgres'
import { Client } from 'pg'
import {
  LOCAL_DATABASE,
  LOCAL_DB_DIR,
  LOCAL_LOG_DIR,
  LOCAL_PASSWORD,
  LOCAL_PORT,
  LOCAL_STUB_FILE,
  LOCAL_USER,
  readCliFlags,
} from './lib/env.mjs'

const flags = readCliFlags()
const action = typeof flags._[0] === 'string' ? flags._[0] : 'start'

function createInstance() {
  return new EmbeddedPostgres({
    databaseDir: LOCAL_DB_DIR,
    port: LOCAL_PORT,
    user: LOCAL_USER,
    password: LOCAL_PASSWORD,
    persistent: true,
    // UTF-8 explícito: sem isso o cluster no Windows nasce em WIN1252 e o texto
    // em português (com acentos) seria gravado de forma incorreta.
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    onLog: () => {},
    onError: (message) => console.error(String(message)),
  })
}

async function resolveBinaries() {
  const platformName =
    { win32: 'windows', linux: 'linux', darwin: 'darwin' }[process.platform] ?? null
  if (!platformName) {
    throw new Error(`Plataforma não suportada pelo cluster local: ${process.platform}`)
  }
  return import(`@embedded-postgres/${platformName}-${process.arch}`)
}

function run(command, args, { quiet = true } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: quiet ? 'ignore' : 'inherit' })
    child.on('close', (code) => resolve(code ?? 1))
    child.on('error', () => resolve(1))
  })
}

async function isRunning() {
  if (!existsSync(join(LOCAL_DB_DIR, 'PG_VERSION'))) return false
  try {
    const binaries = await resolveBinaries()
    return (await run(binaries.pg_ctl, ['-D', LOCAL_DB_DIR, 'status'])) === 0
  } catch {
    return false
  }
}

/**
 * Sobe o cluster com `pg_ctl start`.
 *
 * Usamos o `pg_ctl` (e não o método `start()` da biblioteca) porque o processo
 * do servidor precisa continuar vivo depois que este script termina: `pg_ctl`
 * destaca o postgres, enquanto a biblioteca encerra o cluster ao final do script.
 */
async function startServer() {
  const binaries = await resolveBinaries()
  const logFile = join(LOCAL_LOG_DIR, 'postgres.log')
  const code = await run(binaries.pg_ctl, [
    '-D',
    LOCAL_DB_DIR,
    '-l',
    logFile,
    '-o',
    `-p ${LOCAL_PORT} -c listen_addresses=127.0.0.1`,
    '-w',
    'start',
  ])

  if (code !== 0) {
    throw new Error(
      `pg_ctl não conseguiu iniciar o cluster (código ${code}). Veja ${logFile}.`,
    )
  }
}

async function stopServer() {
  const binaries = await resolveBinaries()
  return run(binaries.pg_ctl, ['-D', LOCAL_DB_DIR, 'stop', '-m', 'fast', '-w'])
}

async function connect(database) {
  const client = new Client({
    host: '127.0.0.1',
    port: LOCAL_PORT,
    user: LOCAL_USER,
    password: LOCAL_PASSWORD,
    database,
  })
  await client.connect()
  return client
}

async function prepareDatabase() {
  const admin = await connect('postgres')
  try {
    const { rows } = await admin.query('select 1 from pg_database where datname = $1', [
      LOCAL_DATABASE,
    ])
    if (rows.length === 0) {
      await admin.query(`create database ${LOCAL_DATABASE}`)
      console.log(`Banco "${LOCAL_DATABASE}" criado.`)
    }
  } finally {
    await admin.end()
  }

  const database = await connect(LOCAL_DATABASE)
  try {
    await database.query(readFileSync(LOCAL_STUB_FILE, 'utf8'))
    console.log('Stub do ambiente Supabase aplicado (schema auth + papéis).')
  } finally {
    await database.end()
  }
}

async function start() {
  if (await isRunning()) {
    console.log(`Cluster local já está em execução na porta ${LOCAL_PORT}.`)
  } else {
    mkdirSync(LOCAL_LOG_DIR, { recursive: true })

    if (!existsSync(join(LOCAL_DB_DIR, 'PG_VERSION'))) {
      console.log(`Inicializando cluster em ${LOCAL_DB_DIR}...`)
      // `initialise()` roda o initdb: processo curto, sem servidor em segundo plano.
      await createInstance().initialise()
    }

    console.log(`Subindo PostgreSQL local na porta ${LOCAL_PORT}...`)
    await startServer()
  }

  await prepareDatabase()

  console.log(
    `\nPronto. Connection string local:\n  postgres://${LOCAL_USER}:${LOCAL_PASSWORD}@127.0.0.1:${LOCAL_PORT}/${LOCAL_DATABASE}\n` +
      'Próximos passos:\n  npm run db:reset-local   (migrations + seed + testes)\n',
  )
}

async function stop() {
  if (!existsSync(join(LOCAL_DB_DIR, 'PG_VERSION'))) {
    console.log('Nenhum cluster local inicializado. Nada a parar.')
    return
  }

  if (!(await isRunning())) {
    console.log('Cluster local já está parado.')
    return
  }

  const code = await stopServer()
  if (code !== 0) {
    throw new Error(`pg_ctl não conseguiu parar o cluster (código ${code}).`)
  }
  console.log('Cluster local parado.')
}

async function status() {
  if (!existsSync(join(LOCAL_DB_DIR, 'PG_VERSION'))) {
    console.log('Cluster local: não inicializado.')
    return
  }

  if (!(await isRunning())) {
    console.log('Cluster local: inicializado, porém parado.')
    return
  }

  const client = await connect(LOCAL_DATABASE)
  try {
    const { rows } = await client.query('select version() as version, current_database() as db')
    console.log(`Cluster local: em execução (${rows[0].db}).`)
    console.log(rows[0].version)
  } finally {
    await client.end()
  }
}

async function reset() {
  await stop()
  rmSync(LOCAL_DB_DIR, { recursive: true, force: true })
  console.log('Dados locais apagados.')
  await start()
}

const actions = { start, stop, status, reset }

const runAction = actions[action]
if (!runAction) {
  console.error(`Ação desconhecida: "${action}". Use: start, stop, status ou reset.`)
  process.exitCode = 1
} else {
  runAction().catch((error) => {
    console.error(`\nERRO: ${error.message}`)
    process.exitCode = 1
  })
}
