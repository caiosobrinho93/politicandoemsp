/** Leitura e identificação dos arquivos SQL de migração/seed. */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export function listSqlFiles(directory) {
  if (!existsSync(directory)) return []

  return readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((name) => {
      const path = join(directory, name)
      const sql = readFileSync(path, 'utf8')
      return {
        name,
        path,
        sql,
        checksum: createHash('sha256').update(sql).digest('hex'),
      }
    })
}

export function formatDuration(startedAt) {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)}s`
}
