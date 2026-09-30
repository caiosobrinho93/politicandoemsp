/**
 * Gera `src/types/database.types.ts` a partir do banco real (tarefa 2.16).
 *
 * O formato do arquivo é o mesmo que a Supabase CLI produz, para que adotar
 * `supabase gen types typescript` no futuro não mude nada no código da aplicação.
 *
 *   npm run db:types
 *   npm run db:types -- --db-url=postgres://...
 */
import { writeFileSync } from 'node:fs'
import { Client } from 'pg'
import { TYPES_FILE, isLocalDbUrl, maskDbUrl, resolveDbUrl } from './lib/env.mjs'

const { url, source } = resolveDbUrl()

const TS_SCALARS = {
  bool: 'boolean',
  int2: 'number',
  int4: 'number',
  int8: 'number',
  float4: 'number',
  float8: 'number',
  numeric: 'number',
  money: 'number',
  uuid: 'string',
  text: 'string',
  varchar: 'string',
  bpchar: 'string',
  char: 'string',
  name: 'string',
  date: 'string',
  timestamptz: 'string',
  timestamp: 'string',
  time: 'string',
  timetz: 'string',
  interval: 'string',
  jsonb: 'Json',
  json: 'Json',
  bytea: 'string',
  void: 'void',
  inet: 'string',
}

async function main() {
  const client = new Client({
    connectionString: url,
    ssl: isLocalDbUrl(url) ? false : { rejectUnauthorized: false },
  })

  console.log(`Gerando tipos a partir de ${maskDbUrl(url)} (origem: ${source})`)
  await client.connect()

  try {
    const tables = await fetchTables(client)
    const columns = await fetchColumns(client)
    const relationships = await fetchRelationships(client)
    const enums = await fetchEnums(client)
    const functions = await fetchFunctions(client)
    const types = await fetchTypes(client)

    const file = renderDocument({ tables, columns, relationships, enums, functions, types })
    writeFileSync(TYPES_FILE, file, 'utf8')
    console.log(
      `Tipos gravados em src/types/database.types.ts ` +
        `(${tables.length} tabelas, ${enums.length} enums, ${functions.length} funções).`,
    )
  } finally {
    await client.end()
  }
}

async function fetchTables(client) {
  const { rows } = await client.query(`
    select c.relname as name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
    order by c.relname
  `)
  return rows.map((row) => row.name)
}

async function fetchColumns(client) {
  const { rows } = await client.query(`
    select
      c.relname as table_name,
      a.attname as column_name,
      a.atttypid as type_oid,
      t.typtype as type_category,
      a.attnotnull as not_null,
      a.atthasdef as has_default,
      a.attidentity as identity,
      a.attgenerated as generated
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_type t on t.oid = a.atttypid
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and a.attnum > 0
      and not a.attisdropped
    order by c.relname, a.attnum
  `)
  return rows
}

async function fetchTypes(client) {
  const { rows } = await client.query(`
    select
      t.oid as oid,
      t.typname as name,
      t.typtype as category,
      t.typcategory as class,
      tn.nspname as schema,
      c.relname as relation_name,
      c.relkind as relation_kind,
      et.typname as element_name
    from pg_type t
    join pg_namespace tn on tn.oid = t.typnamespace
    left join pg_class c on c.oid = t.typrelid
    left join pg_type et on et.oid = t.typelem
    where tn.nspname in ('public', 'pg_catalog')
  `)
  return new Map(rows.map((row) => [String(row.oid), row]))
}

async function fetchRelationships(client) {
  const { rows } = await client.query(`
    select
      con.conname as foreign_key_name,
      src.relname as table_name,
      tgt.relname as referenced_relation,
      (
        select array_agg(sa.attname order by u.ord)
        from unnest(con.conkey) with ordinality as u(attnum, ord)
        join pg_attribute sa on sa.attrelid = con.conrelid and sa.attnum = u.attnum
      ) as columns,
      (
        select array_agg(ta.attname order by u.ord)
        from unnest(con.confkey) with ordinality as u(attnum, ord)
        join pg_attribute ta on ta.attrelid = con.confrelid and ta.attnum = u.attnum
      ) as referenced_columns,
      (
        select count(*) = 1
        from pg_index i
        where i.indrelid = con.conrelid
          and i.indisunique
          and i.indpred is null
          and i.indnkeyatts = array_length(con.conkey, 1)
          and (select array_agg(k order by k) from unnest(i.indkey::int[]) as k)
            = (select array_agg(k order by k) from unnest(con.conkey::int[]) as k)
      ) as is_one_to_one
    from pg_constraint con
    join pg_class src on src.oid = con.conrelid
    join pg_class tgt on tgt.oid = con.confrelid
    join pg_namespace n on n.oid = con.connamespace
    where con.contype = 'f' and n.nspname = 'public'
    order by src.relname, con.conname
  `)
  return rows
}

async function fetchEnums(client) {
  const { rows } = await client.query(`
    select t.typname as name, e.enumlabel as label
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
    order by t.typname, e.enumsortorder
  `)

  const byName = new Map()
  for (const row of rows) {
    if (!byName.has(row.name)) byName.set(row.name, [])
    byName.get(row.name).push(row.label)
  }
  return [...byName.entries()].map(([name, labels]) => ({ name, labels }))
}

async function fetchFunctions(client) {
  const { rows } = await client.query(`
    select
      p.proname as name,
      p.prorettype as return_type_oid,
      p.proretset as returns_set,
      coalesce(p.proallargtypes::oid[], p.proargtypes::oid[]) as arg_type_oids,
      p.proargmodes::text[] as arg_modes,
      p.proargnames as arg_names,
      p.pronargdefaults as default_count,
      p.pronargs as total_args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_type rt on rt.oid = p.prorettype
    where n.nspname = 'public'
      and p.prokind = 'f'
      and rt.typname <> 'trigger'
    order by p.proname
  `)
  return rows
}

/* -------------------------------------------------------------------------- */
/* Mapeamento de tipos PostgreSQL → TypeScript                                */
/* -------------------------------------------------------------------------- */

function isIdentifier(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)
}

function propertyKey(name) {
  return isIdentifier(name) ? name : `"${name}"`
}

/**
 * Normaliza listas vindas do banco.
 *
 * O driver `pg` às vezes entrega array PostgreSQL como literal de texto
 * (`{a,b}`) em vez de array JavaScript — o gerador aceita os dois formatos.
 */
function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []

  const inner = value.replace(/^\{/, '').replace(/\}$/, '')
  if (inner.length === 0) return []

  return inner.split(',').map((item) => item.replace(/^"|"$/g, ''))
}

function enumTypeName(name) {
  return `Database["public"]["Enums"]["${name}"]`
}

function rowTypeName(relation) {
  return `Database["public"]["Tables"]["${relation}"]["Row"]`
}

function findType(types, name, schema) {
  for (const type of types.values()) {
    if (type.name === name && type.schema === schema) return type
  }
  return undefined
}

function tsTypeByOid(oid, types, enums) {
  const type = types.get(String(oid))
  if (!type) return 'unknown'
  return tsTypeFor(type, types, enums)
}

function tsTypeFor(type, types, enums) {
  if (type.class === 'A') {
    const elementName = type.element_name
    if (!elementName) return 'unknown'

    const publicElement = findType(types, elementName, 'public')
    let inner
    if (publicElement && enums.some((item) => item.name === elementName)) {
      inner = enumTypeName(elementName)
    } else if (publicElement && publicElement.category === 'c' && publicElement.relation_name) {
      inner = rowTypeName(publicElement.relation_name)
    } else {
      inner = TS_SCALARS[elementName] ?? 'unknown'
    }
    return `${inner}[]`
  }

  if (type.category === 'e') return enumTypeName(type.name)
  if (type.category === 'c' && type.relation_name) return rowTypeName(type.relation_name)
  return TS_SCALARS[type.name] ?? 'unknown'
}

/* -------------------------------------------------------------------------- */
/* Renderização                                                               */
/* -------------------------------------------------------------------------- */

function renderDocument({ tables, columns, relationships, enums, functions, types }) {
  const lines = []

  lines.push('/* eslint-disable */')
  lines.push('/**')
  lines.push(' * Tipos do banco de dados — ARQUIVO GERADO AUTOMATICAMENTE.')
  lines.push(' *')
  lines.push(' * Não edite à mão: altere a migração em `supabase/migrations` e rode')
  lines.push(' * `npm run db:types` (scripts/db/generate-types.mjs) para regerar.')
  lines.push(' * O formato é o mesmo produzido por `supabase gen types typescript`.')
  lines.push(' */')
  lines.push('')
  lines.push(
    'export type Json =',
  )
  lines.push('  | string')
  lines.push('  | number')
  lines.push('  | boolean')
  lines.push('  | null')
  lines.push('  | { [key: string]: Json | undefined }')
  lines.push('  | Json[]')
  lines.push('')
  lines.push('export type Database = {')
  lines.push('  public: {')
  lines.push('    Tables: {')

  for (const table of tables) {
    const tableColumns = columns.filter((column) => column.table_name === table)
    const tableRelationships = relationships.filter((row) => row.table_name === table)

    lines.push(`      ${propertyKey(table)}: {`)
    lines.push(...renderColumnSet('Row', tableColumns, types, enums, 'row'))
    lines.push('')
    lines.push(...renderColumnSet('Insert', tableColumns, types, enums, 'insert'))
    lines.push('')
    lines.push(...renderColumnSet('Update', tableColumns, types, enums, 'update'))
    lines.push('')
    lines.push(...renderRelationships(tableRelationships))
    lines.push('      }')
  }

  lines.push('    }')
  lines.push('    Views: {')
  lines.push('      [_ in never]: never')
  lines.push('    }')
  lines.push('    Functions: {')
  lines.push(...renderFunctions(functions, types, enums))
  lines.push('    }')
  lines.push('    Enums: {')
  for (const item of enums) {
    lines.push(`      ${propertyKey(item.name)}: ${item.labels.map((label) => `"${label}"`).join(' | ')}`)
  }
  lines.push('    }')
  lines.push('    CompositeTypes: {')
  lines.push('      [_ in never]: never')
  lines.push('    }')
  lines.push('  }')
  lines.push('}')
  lines.push('')
  lines.push(...renderHelperTypes())

  return `${lines.join('\n')}\n`
}

function renderColumnSet(name, columns, types, enums, kind) {
  const lines = [`        ${name}: {`]

  for (const column of columns) {
    // Colunas geradas pelo banco nunca são escritas pela aplicação.
    if (kind !== 'row' && column.generated === 's') continue

    const type = tsTypeByOid(column.type_oid, types, enums)
    const nullable = column.not_null !== true
    const valueType = nullable ? `${type} | null` : type

    if (kind === 'row') {
      lines.push(`          ${propertyKey(column.column_name)}: ${valueType}`)
      continue
    }

    const optional =
      kind === 'update' || nullable || Boolean(column.has_default) || Boolean(column.identity)
    lines.push(`          ${propertyKey(column.column_name)}${optional ? '?' : ''}: ${valueType}`)
  }

  lines.push('        }')
  return lines
}

function renderRelationships(rows) {
  if (rows.length === 0) return ['        Relationships: []']

  const lines = ['        Relationships: [']
  for (const row of rows) {
    lines.push('          {')
    lines.push(`            foreignKeyName: "${row.foreign_key_name}"`)
    lines.push(`            columns: [${toArray(row.columns).map((name) => `"${name}"`).join(', ')}]`)
    lines.push(`            isOneToOne: ${row.is_one_to_one === true}`)
    lines.push(`            referencedRelation: "${row.referenced_relation}"`)
    lines.push(
      `            referencedColumns: [${toArray(row.referenced_columns)
        .map((name) => `"${name}"`)
        .join(', ')}]`,
    )
    lines.push('          },')
  }
  lines.push('        ]')
  return lines
}

function renderFunctions(functions, types, enums) {
  if (functions.length === 0) return ['      [_ in never]: never']

  const lines = []
  for (const fn of functions) {
    const argOids = toArray(fn.arg_type_oids)
    const argNames = toArray(fn.arg_names)
    const argModes = fn.arg_modes === null || fn.arg_modes === undefined ? null : toArray(fn.arg_modes)
    const defaultCount = Number(fn.default_count ?? 0)

    const inputArgs = []
    argOids.forEach((oid, index) => {
      const mode = argModes ? argModes[index] : 'i'
      // 'o' (OUT) e 't' (TABLE) não são argumentos de entrada.
      if (mode !== 'i' && mode !== 'b' && mode !== 'v') return
      inputArgs.push({
        name: argNames[index] ?? `arg${index + 1}`,
        type: tsTypeByOid(oid, types, enums),
      })
    })

    const firstOptional = inputArgs.length - defaultCount
    const args = inputArgs
      .map((arg, index) => `${arg.name}${index >= firstOptional ? '?' : ''}: ${arg.type}`)
      .join('; ')

    const inner = tsTypeByOid(fn.return_type_oid, types, enums)
    const returns = fn.returns_set ? `${inner === 'void' ? 'undefined' : inner}[]` : inner

    lines.push(`      ${propertyKey(fn.name)}: {`)
    lines.push(`        Args: { ${args} }`)
    lines.push(`        Returns: ${returns}`)
    lines.push('      }')
  }
  return lines
}

function renderHelperTypes() {
  return [
    'export type PublicSchema = Database["public"]',
    '',
    'export type Tables<T extends keyof PublicSchema["Tables"]> =',
    '  PublicSchema["Tables"][T]["Row"]',
    'export type TablesInsert<T extends keyof PublicSchema["Tables"]> =',
    '  PublicSchema["Tables"][T]["Insert"]',
    'export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =',
    '  PublicSchema["Tables"][T]["Update"]',
    'export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]',
  ]
}

main().catch((error) => {
  console.error(`\nERRO: ${error.message}`)
  process.exitCode = 1
})



