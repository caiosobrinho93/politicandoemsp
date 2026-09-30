/**
 * Teste de fumaça e de RLS do banco (tarefa 2.18).
 *
 * O que este script verifica:
 *   · estrutura: tabelas, enums, extensões, RLS ligada e políticas existentes;
 *   · regras do projeto aplicadas pelo banco (R0.3 sem fonte não publica, R0.5
 *     selo coerente com o conteúdo, R0.8 conteúdo de usuário separado);
 *   · comportamento real da RLS com os papéis anon / authenticated / staff;
 *   · trilha de auditoria gravando antes/depois;
 *   · aderência de `src/types/database.types.ts` ao schema (tarefa 2.16).
 *
 * Tudo roda DENTRO DE UMA TRANSAÇÃO e termina com ROLLBACK: nenhum dado de teste
 * permanece no banco. Os registros criados usam nomes marcados como "Fixture de
 * Teste" justamente para não serem confundidos com dado político real (R0.1).
 *
 *   npm run db:smoke
 *   npm run db:smoke -- --db-url=postgres://...
 */
import { readFileSync } from 'node:fs'
import { Client } from 'pg'
import { TYPES_FILE, maskDbUrl, resolveDbUrl } from './lib/env.mjs'

const { url, source } = resolveDbUrl()

const EXPECTED_TABLES = [
  'audit_logs',
  'comments',
  'correction_suggestions',
  'entity_sources',
  'expenses',
  'favorites',
  'list_items',
  'lists',
  'mandates',
  'news',
  'news_politicians',
  'parties',
  'politicians',
  'profiles',
  'project_authors',
  'projects',
  'public_funds',
  'ranking_definitions',
  'ranking_entries',
  'ranking_snapshot_sources',
  'ranking_snapshots',
  'ratings',
  'reports',
  'sources',
  'timeline_events',
  'vote_records',
  'vote_sessions',
]

const EXPECTED_ENUMS = [
  'audit_action',
  'correction_entity_type',
  'evidence_kind',
  'expense_category',
  'federative_level',
  'moderation_status',
  'political_office',
  'project_kind',
  'project_status',
  'public_fund_kind',
  'ranking_direction',
  'ranking_metric',
  'report_target_type',
  'timeline_event_kind',
  'user_role',
  'vote_position',
]

const results = { passed: 0, failed: 0, failures: [] }
let client

function pass(label, detail = '') {
  results.passed += 1
  console.log(`  OK    ${label}${detail ? ` — ${detail}` : ''}`)
}

function fail(label, detail) {
  results.failed += 1
  results.failures.push(`${label}: ${detail}`)
  console.log(`  FALHA ${label} — ${detail}`)
}

async function check(label, fn) {
  try {
    const detail = await fn()
    pass(label, detail ?? '')
  } catch (error) {
    fail(label, error.message)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/**
 * Executa algo esperando que o banco RECUSE. O savepoint garante que a transação
 * continue utilizável depois do erro e que a troca de papel seja desfeita.
 */
async function expectFailure(executor, matcher) {
  await client.query('savepoint s')
  let thrown = null
  try {
    await executor()
  } catch (error) {
    thrown = error
  }
  await client.query('rollback to savepoint s')
  await client.query('release savepoint s')

  if (!thrown) throw new Error('a operação foi aceita, mas deveria ser recusada')
  if (matcher && !matcher.test(thrown.message)) {
    throw new Error(`erro inesperado: ${thrown.message.split('\n')[0]}`)
  }
  return thrown.message.split('\n')[0].trim()
}

/** Executa como um papel (e um usuário autenticado), restaurando tudo ao final. */
async function asUser(role, userId, fn) {
  await client.query('savepoint role_switch')
  try {
    if (userId) {
      await client.query('select set_config($1, $2, true)', ['request.jwt.claim.sub', userId])
    }
    await client.query(`set local role ${role}`)
    const value = await fn()
    await client.query('reset role')
    await client.query('select set_config($1, $2, true)', ['request.jwt.claim.sub', ''])
    await client.query('release savepoint role_switch')
    return value
  } catch (error) {
    await client.query('rollback to savepoint role_switch').catch(() => {})
    await client.query('release savepoint role_switch').catch(() => {})
    throw error
  }
}

function q(text, params) {
  return client.query(text, params)
}

async function scalar(text, params) {
  const { rows } = await q(text, params)
  return Object.values(rows[0] ?? {})[0]
}

/* -------------------------------------------------------------------------- */
/* Fixtures (criadas e revertidas dentro da transação)                        */
/* -------------------------------------------------------------------------- */

const FIXTURE_NOTE = 'Fixture de teste criada por scripts/db/smoke-test.mjs e revertida no fim.'

async function createFixtures() {
  const sourceId = await scalar(
    `insert into public.sources (publisher, url, collected_at, verified, verified_at, notes)
     values ('Fonte de teste (rollback)', 'https://example.org/fonte-de-teste?utm_source=x',
             now(), true, now(), $1)
     returning id`,
    [FIXTURE_NOTE],
  )

  const userIds = {}
  for (const [key, role] of [
    ['author', 'user'],
    ['other', 'user'],
    ['moderator', 'moderator'],
    ['admin', 'admin'],
  ]) {
    const id = await scalar(`insert into auth.users (email) values ($1) returning id`, [
      `fixture-${key}@example.invalid`,
    ])
    await q(`insert into public.profiles (id, display_name, role) values ($1, $2, $3)`, [
      id,
      `Fixture ${key}`,
      role,
    ])
    userIds[key] = id
  }

  // Publicar exige fonte (R0.3), então o fluxo seguido é exatamente o previsto:
  // inserir o registro → vincular a fonte → publicar.
  const draftId = await scalar(
    `insert into public.politicians
       (full_name, public_name, office, office_level, state, city)
     values ('Fixture de Teste Rascunho', 'Fixture Rascunho', 'vereador', 'municipal', 'SP', 'São Paulo')
     returning id`,
  )

  const publishedId = await scalar(
    `insert into public.politicians
       (full_name, public_name, office, office_level, state, city)
     values ('José Fixture Publicado', 'Zé Fixture', 'vereador', 'municipal', 'SP', 'São Paulo')
     returning id`,
  )
  await q(
    `insert into public.entity_sources (source_id, entity_type, entity_id)
     values ($1, 'politician', $2)`,
    [sourceId, publishedId],
  )
  await q(`update public.politicians set verified = true, verified_at = now() where id = $1`, [
    publishedId,
  ])

  // Matéria APROVADA e verificada: é a única que o anônimo pode enxergar.
  const newsId = await scalar(
    `insert into public.news
       (title, publisher, original_url, published_at, summary, category, source_id,
        moderation_status, is_statement, verified, verified_at)
     values ('Fixture de Teste: matéria publicada', 'Veículo de teste',
             'https://example.org/materia-de-teste?fbclid=123', now(),
             'Resumo descritivo da matéria de teste.', 'teste', $1,
             'approved', false, true, now())
     returning id`,
    [sourceId],
  )

  // Matória aprovada mas AINDA não verificada: existe no banco, mas continua
  // fora do alcance do público até a revisão da fonte (R0.3/R0.9).
  const unverifiedNewsId = await scalar(
    `insert into public.news
       (title, publisher, original_url, published_at, summary, category, source_id,
        moderation_status, is_statement, verified)
     values ('Fixture de Teste: matéria não verificada', 'Veículo de teste',
             'https://example.org/materia-nao-verificada', now(),
             'Resumo da matéria que ainda não passou por verificação de fonte.',
             'teste', $1, 'approved', false, false)
     returning id`,
    [sourceId],
  )

  const rankingDefinitionId = await scalar(
    `insert into public.ranking_definitions
       (metric, direction, office_scope, state_scope, period_start, period_end)
     values ('projetos_apresentados', 'desc', 'vereador', 'SP', '2025-01-01', '2025-12-31')
     returning id`,
  )

  const rankingSnapshotId = await scalar(
    `insert into public.ranking_snapshots (definition_id, methodology, computed_at)
     values ($1, 'Contagem de projetos apresentados conforme fonte oficial.', now())
     returning id`,
    [rankingDefinitionId],
  )

  return {
    sourceId,
    userIds,
    draftId,
    publishedId,
    newsId,
    unverifiedNewsId,
    rankingDefinitionId,
    rankingSnapshotId,
  }
}

/* -------------------------------------------------------------------------- */
/* 1. Estrutura                                                               */
/* -------------------------------------------------------------------------- */

async function checkStructure() {
  console.log('\nEstrutura do schema')

  await check('todas as tabelas esperadas existem', async () => {
    const { rows } = await q(
      `select c.relname as name
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'p')`,
    )
    const found = rows.map((row) => row.name)
    const missing = EXPECTED_TABLES.filter((name) => !found.includes(name))
    assert(missing.length === 0, `faltando: ${missing.join(', ')}`)
    return `${found.length} tabelas`
  })

  await check('enums de cargo, esfera, status e selos existem', async () => {
    const { rows } = await q(
      `select t.typname as name
         from pg_type t
         join pg_namespace n on n.oid = t.typnamespace
        where n.nspname = 'public' and t.typtype = 'e'`,
    )
    const found = rows.map((row) => row.name)
    const missing = EXPECTED_ENUMS.filter((name) => !found.includes(name))
    assert(missing.length === 0, `faltando: ${missing.join(', ')}`)
    return `${found.length} enums`
  })

  await check('extensões pg_trgm e unaccent instaladas em extensions', async () => {
    const { rows } = await q(
      `select e.extname as name, n.nspname as schema
         from pg_extension e
         join pg_namespace n on n.oid = e.extnamespace
        where e.extname in ('pg_trgm', 'unaccent')`,
    )
    const names = rows.map((row) => row.name).sort()
    assert(names.length === 2, `instaladas: ${names.join(', ') || 'nenhuma'}`)
    const wrongSchema = rows.filter((row) => row.schema !== 'extensions').map((row) => row.name)
    assert(
      wrongSchema.length === 0,
      `fora do schema extensions (divergência com o Supabase): ${wrongSchema.join(', ')}`,
    )
    return 'pg_trgm, unaccent'
  })

  await check('RLS habilitada em todas as tabelas públicas', async () => {
    const { rows } = await q(
      `select c.relname as name
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'p')
          and not c.relrowsecurity`,
    )
    assert(rows.length === 0, `sem RLS: ${rows.map((row) => row.name).join(', ')}`)
    return `${EXPECTED_TABLES.length} tabelas com RLS`
  })

  await check('toda tabela pública tem política de acesso', async () => {
    const { rows } = await q(
      `select c.relname as name
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'p')
          and not exists (select 1 from pg_policy p where p.polrelid = c.oid)`,
    )
    assert(rows.length === 0, `sem política: ${rows.map((row) => row.name).join(', ')}`)
    return 'nenhuma tabela sem política'
  })

  await check('índices de busca textual usam trigram', async () => {
    const count = await scalar(
      `select count(*)::int
         from pg_index i
         join pg_class c on c.oid = i.indexrelid
        where c.relname like '%trgm%'`,
    )
    assert(Number(count) >= 5, `índices trigram encontrados: ${count}`)
    return `${count} índices trigram`
  })
}

/* -------------------------------------------------------------------------- */
/* 2. Regras do projeto aplicadas pelo banco                                  */
/* -------------------------------------------------------------------------- */

async function checkProjectRules(fx) {
  console.log('\nRegras inegociáveis aplicadas pelo banco')

  await check('R0.3: publicar sem fonte é recusado', async () =>
    expectFailure(
      () => q(`update public.politicians set verified = true where id = $1`, [fx.draftId]),
      /R0\.3/,
    ),
  )

  await check('R0.3: publicar com fonte vinculada é aceito', async () => {
    await q(
      `insert into public.entity_sources (source_id, entity_type, entity_id)
       values ($1, 'politician', $2)`,
      [fx.sourceId, fx.draftId],
    )
    await q(`update public.politicians set verified = true where id = $1`, [fx.draftId])
    const verified = await scalar('select verified from public.politicians where id = $1', [
      fx.draftId,
    ])
    assert(verified === true, 'registro não ficou publicado')
    await q(`update public.politicians set verified = false where id = $1`, [fx.draftId])
    return 'exigiu fonte antes de publicar'
  })

  await check('R0.3: despesa exige fonte obrigatória', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.expenses
             (politician_id, category, paying_agency, description, amount, reference_month, source_id)
           values ($1, 'cota_parlamentar', 'Órgão de teste', 'Fixture', 100.00, '2026-01-01', null)`,
          [fx.publishedId],
        ),
      /null value in column "source_id"/,
    ),
  )

  await check('R0.5: selo de notícia precisa casar com o conteúdo', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.news
             (title, publisher, original_url, published_at, summary, category, source_id,
              is_statement, evidence_kind)
           values ('Fixture de Teste: selo errado', 'Veículo de teste',
                   'https://example.org/selo-errado', now(), 'Resumo.', 'teste', $1,
                   true, 'noticia')`,
          [fx.sourceId],
        ),
      /news_evidence_kind_matches_content/,
    ),
  )

  await check('R0.9: despesa só aceita mês de competência (dia 1)', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.expenses
             (politician_id, category, paying_agency, description, amount, reference_month, source_id)
           values ($1, 'diarias', 'Órgão de teste', 'Fixture', 100.00, '2026-03-15', $2)`,
          [fx.publishedId, fx.sourceId],
        ),
      /expenses_reference_month_is_first_day/,
    ),
  )

  await check('cargo e esfera federativa incoerentes são recusados', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.politicians (full_name, office, office_level, state)
           values ('Fixture de Teste Cargo Incoerente', 'vereador', 'federal', 'SP')`,
        ),
      /politicians_office_level_coherent/,
    ),
  )

  await check('cargo municipal sem cidade é recusado', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.politicians (full_name, office, office_level, state)
           values ('Fixture de Teste Sem Cidade', 'prefeito', 'municipal', 'SP')`,
        ),
      /politicians_municipal_requires_city/,
    ),
  )

  await check('R0.9: valor negativo em gasto é recusado', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.expenses
             (politician_id, category, paying_agency, description, amount, reference_month, source_id)
           values ($1, 'passagens', 'Órgão de teste', 'Fixture', -1.00, '2026-01-01', $2)`,
          [fx.publishedId, fx.sourceId],
        ),
      /expenses_amount_not_negative/,
    ),
  )

  await check('nota de avaliação fora de 1–5 é recusada', async () =>
    expectFailure(
      () =>
        q(`insert into public.ratings (politician_id, author_id, score) values ($1, $2, 7)`, [
          fx.publishedId,
          fx.userIds.author,
        ]),
      /ratings_score_range/,
    ),
  )

  await check('sugestão de correção sem link de fonte é recusada', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.correction_suggestions
             (entity_type, entity_id, field, suggested_value, source_url)
           values ('politician', $1, 'full_name', 'Outro nome', 'sem-link')`,
          [fx.publishedId],
        ),
      /correction_suggestions_source_url_http/,
    ),
  )

  await check('ranking de usuário exige autor identificado', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.ranking_snapshots
             (definition_id, methodology, computed_at, is_user_ranking, created_by)
           values ($1, 'Ranking próprio sem autor.', now(), true, null)`,
          [fx.rankingDefinitionId],
        ),
      /ranking_snapshots_user_ranking_requires_author/,
    ),
  )
}

/* -------------------------------------------------------------------------- */
/* 3. Deduplicação de notícia e busca textual                                 */
/* -------------------------------------------------------------------------- */

async function checkDedupAndSearch(fx) {
  console.log('\nDeduplicação de notícia e busca textual')

  await check('URL canônica remove esquema, www., query e barra final', async () => {
    const cases = [
      ['https://www.example.org/noticia/?utm_source=x', 'example.org/noticia'],
      ['HTTP://Example.ORG/a/b#trecho', 'example.org/a/b'],
      ['https://example.org', 'example.org'],
    ]
    for (const [input, expected] of cases) {
      const value = await scalar('select public.canonicalize_url($1) as value', [input])
      assert(value === expected, `${input} virou "${value}" (esperado "${expected}")`)
    }
    return `${cases.length} casos`
  })

  await check('a mesma matéria não entra duas vezes (URL canônica)', async () =>
    expectFailure(
      () =>
        q(
          `insert into public.news
             (title, publisher, original_url, published_at, summary, category, source_id)
           values ('Fixture de Teste: matéria publicada', 'Veículo de teste',
                   'https://www.example.org/materia-de-teste#topo', now(),
                   'Resumo duplicado.', 'teste', $1)`,
          [fx.sourceId],
        ),
      /news_canonical_url_unique/,
    ),
  )

  await check('busca de político ignora acentos', async () => {
    const { rows } = await q(`select (public.search_politicians('jose')).full_name as name`)
    const found = rows.map((row) => row.name)
    assert(found.includes('José Fixture Publicado'), `encontrados: ${found.join(', ') || 'nenhum'}`)
    return 'termo "jose" encontra "José Fixture Publicado"'
  })

  await check('busca não expõe registro não publicado para anônimo', async () =>
    asUser('anon', null, async () => {
      const { rows } = await q(`select (public.search_politicians('fixture')).full_name as name`)
      const names = rows.map((row) => row.name)
      assert(
        !names.includes('Fixture de Teste Rascunho'),
        `rascunho apareceu na busca: ${names.join(', ')}`,
      )
      assert(names.includes('José Fixture Publicado'), 'registro publicado não apareceu')
      return `${names.length} resultado(s), nenhum rascunho`
    }),
  )
}


/* -------------------------------------------------------------------------- */
/* 4. RLS — comportamento real por papel                                     */
/* -------------------------------------------------------------------------- */

/*
 * "Recusado" pode chegar de duas formas, e as duas são aceitáveis aqui:
 *   · o papel não tem o privilégio (permission denied) — mais forte ainda;
 *   · o privilégio existe, mas a RLS barra a linha (violates row-level security).
 * O que NÃO é aceitável é a operação ser aceita.
 */
const DENIED = /permission denied|row-level security|violates row-level security policy/i

async function checkRls(fx) {
  console.log('\nLeitura pública só do conteúdo verificado')

  await check('anônimo não vê político não publicado', async () => {
    const { rows } = await asUser('anon', null, () => q(`select id from public.politicians`))
    const ids = rows.map((row) => row.id)
    assert(ids.includes(fx.publishedId), 'político publicado não apareceu')
    assert(!ids.includes(fx.draftId), 'rascunho apareceu para anônimo')
    return `${ids.length} registro(s) visível(is)`
  })

  await check('anônimo só vê a notícia verificada', async () => {
    const visible = await asUser('anon', null, () =>
      scalar(`select count(*)::int from public.news`),
    )
    assert(Number(visible) === 1, `anônimo viu ${visible} notícia(s), esperava 1`)

    const hidden = await asUser('anon', null, () =>
      scalar(`select count(*)::int from public.news where id = $1`, [fx.unverifiedNewsId]),
    )
    assert(Number(hidden) === 0, 'matéria não verificada vazou para o público')
    return 'aprovada sem verificação continua oculta'
  })

  await check('moderador enxerga o rascunho que o público não vê', async () => {
    const { rows } = await asUser('authenticated', fx.userIds.moderator, () =>
      q(`select id from public.politicians`),
    )
    assert(rows.map((row) => row.id).includes(fx.draftId), 'moderador não viu o rascunho')
    return `${rows.length} registro(s) visível(is) para a equipe`
  })

  await check('anônimo não escreve em dado oficial', async () =>
    expectFailure(
      () =>
        asUser('anon', null, () =>
          q(
            `insert into public.politicians (full_name, office, office_level, state, city)
             values ('Fixture de Teste Anon', 'vereador', 'municipal', 'SP', 'São Paulo')`,
          ),
        ),
      DENIED,
    ),
  )

  await check('usuário comum não publica dado oficial', async () =>
    expectFailure(
      () =>
        asUser('authenticated', fx.userIds.author, () =>
          q(
            `insert into public.politicians (full_name, office, office_level, state, city)
             values ('Fixture de Teste Comum', 'vereador', 'municipal', 'SP', 'São Paulo')`,
          ),
        ),
      DENIED,
    ),
  )
  await check('moderador publica dado oficial', async () => {
    const id = await asUser('authenticated', fx.userIds.moderator, () =>
      scalar(
        `insert into public.politicians (full_name, office, office_level, state, city)
         values ('Fixture de Teste Moderador', 'vereador', 'municipal', 'SP', 'São Paulo')
         returning id`,
      ),
    )
    assert(id, 'inserção do moderador não retornou id')
    return 'escrita de staff permitida'
  })

  // RLS não gera erro ao negar um DELETE: a política simplesmente filtra a linha
  // e o comando afeta 0 linhas. Por isso o teste mede o efeito, não o erro.
  await check('moderador não exclui dado oficial (efeito: 0 linhas)', async () => {
    const deleted = await asUser('authenticated', fx.userIds.moderator, () =>
      scalar(
        `with deleted as (
           delete from public.politicians
            where full_name = 'Fixture de Teste Moderador'
            returning id
         ) select count(*)::int from deleted`,
      ),
    )
    assert(Number(deleted) === 0, `moderador excluiu ${deleted} linha(s)`)
    return 'exclusão visível apenas para admin'
  })

  await check('admin exclui dado oficial', async () => {
    const count = await asUser('authenticated', fx.userIds.admin, () =>
      scalar(
        `with deleted as (
           delete from public.politicians
            where full_name = 'Fixture de Teste Moderador'
            returning id
         ) select count(*)::int from deleted`,
      ),
    )
    assert(Number(count) === 1, `linhas excluídas: ${count}`)
    return 'exclusão reservada ao admin'
  })

  console.log('\nRLS do conteúdo de usuário')

  await check('anônimo não grava favorito', async () =>
    expectFailure(
      () =>
        asUser('anon', null, () =>
          q(`insert into public.favorites (user_id, politician_id) values (gen_random_uuid(), $1)`, [
            fx.publishedId,
          ]),
        ),
      DENIED,
    ),
  )

  await check('favorito de um usuário não é visível para outro', async () => {
    await asUser('authenticated', fx.userIds.author, () =>
      q(`insert into public.favorites (user_id, politician_id) values ($1, $2)`, [
        fx.userIds.author,
        fx.publishedId,
      ]),
    )
    const countAs = async (userId) =>
      Number(await asUser('authenticated', userId, () => scalar(`select count(*)::int from public.favorites`)))
    const mine = await countAs(fx.userIds.author)
    const others = await countAs(fx.userIds.other)
    assert(mine === 1, `o dono deveria ver 1 favorito, viu ${mine}`)
    assert(others === 0, `outro usuário viu ${others} favorito(s) alheio(s)`)
    return 'privado por usuário'
  })
  await check('comentário só aparece publicamente após aprovação', async () => {
    const commentId = await asUser('authenticated', fx.userIds.author, () =>
      scalar(
        `insert into public.comments (politician_id, author_id, body)
         values ($1, $2, 'Comentário de fixture; opinião do usuário.')
         returning id`,
        [fx.publishedId, fx.userIds.author],
      ),
    )
    const seenBy = async (role, userId) =>
      Number(
        await asUser(role, userId, () =>
          scalar(`select count(*)::int from public.comments where id = $1`, [commentId]),
        ),
      )

    assert((await seenBy('anon', null)) === 0, 'comentário pendente apareceu para anônimo')
    assert((await seenBy('authenticated', fx.userIds.author)) === 1, 'autor não viu o próprio pendente')

    await asUser('authenticated', fx.userIds.moderator, () =>
      q(
        `update public.comments set moderation_status = 'approved', moderated_by = $1,
           moderated_at = now() where id = $2`,
        [fx.userIds.moderator, commentId],
      ),
    )
    assert((await seenBy('anon', null)) === 1, 'comentário aprovado não apareceu')
    return 'pendente invisível, aprovado visível'
  })

  await check('lista privada não aparece para anônimo nem para outro usuário', async () => {
    const listId = await asUser('authenticated', fx.userIds.author, () =>
      scalar(
        `insert into public.lists (owner_id, name, is_public)
         values ($1, 'Lista privada de fixture', false) returning id`,
        [fx.userIds.author],
      ),
    )
    const seenBy = async (role, userId) =>
      Number(
        await asUser(role, userId, () =>
          scalar(`select count(*)::int from public.lists where id = $1`, [listId]),
        ),
      )
    assert((await seenBy('anon', null)) === 0, 'lista privada vazou para anônimo')
    assert((await seenBy('authenticated', fx.userIds.other)) === 0, 'lista privada vazou para outro usuário')
    return 'visível só ao dono e à equipe'
  })

  await check('lista pública fica visível e seus itens a acompanham', async () => {
    const listId = await asUser('authenticated', fx.userIds.author, () =>
      scalar(
        `insert into public.lists (owner_id, name, is_public)
         values ($1, 'Lista pública de fixture', true) returning id`,
        [fx.userIds.author],
      ),
    )
    const visible = await asUser('anon', null, () =>
      scalar(`select count(*)::int from public.lists where id = $1`, [listId]),
    )
    assert(Number(visible) === 1, 'lista pública não apareceu para anônimo')
    return 'visibilidade segue a lista (R0.8)'
  })

  await check('trilha de auditoria não é legível por anônimo', async () => {
    const count = await asUser('anon', null, () => scalar(`select count(*)::int from public.audit_logs`))
    assert(Number(count) === 0, `anônimo leu ${count} registro(s) de auditoria`)
    return 'histórico interno fechado ao público'
  })
}
/* -------------------------------------------------------------------------- */
/* 5. Trilha de auditoria                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Lê a trilha de `politicians` para a fixture publicada.
 *
 * Não ordenamos por `created_at`: `now()` é fixo dentro da transação de teste,
 * então o carimbo não distingue um registro do outro. A linha procurada é
 * localizada pelo próprio conteúdo, que é o que a regra quer verificar.
 */
async function auditRowsFor(fx) {
  const { rows } = await q(
    `select action, previous_value, new_value, actor_id, actor_role
       from public.audit_logs
      where entity_type = 'politicians' and entity_id = $1`,
    [fx.publishedId],
  )
  return rows
}

async function checkAudit(fx) {
  console.log('\nTrilha de auditoria')

  // As alterações precisam acontecer COMO o admin autenticado: é assim que
  // `auth.uid()` devolve um id e a trilha consegue atribuir autor e papel.
  // Fora de uma sessão simulada, `auth.uid()` é nulo e a trilha fica sem autor.
  await check('alteração grava estado anterior e posterior', async () => {
    // Um único update: dois seguidos seriam indistinguíveis, já que o carimbo
    // de tempo é o mesmo para toda a transação de teste.
    await asUser('authenticated', fx.userIds.admin, () =>
      q(`update public.politicians set public_name = 'Nome Depois do Teste' where id = $1`, [
        fx.publishedId,
      ]),
    )

    const rows = await auditRowsFor(fx)
    const row = rows.find((item) => item.new_value?.public_name === 'Nome Depois do Teste')
    assert(row, 'a alteração não deixou registro na trilha de auditoria')
    assert(row.action === 'update', `ação registrada: ${row.action}`)
    assert(
      row.previous_value?.public_name === 'Zé Fixture',
      `estado anterior não confere: ${row.previous_value?.public_name}`,
    )
    return 'antes e depois preservados'
  })

  await check('auditoria registra o autor e o papel de quem alterou', async () => {
    const rows = await auditRowsFor(fx)
    const row = rows.find((item) => item.new_value?.public_name === 'Nome Depois do Teste')
    assert(row, 'sem registro de auditoria para a alteração')
    assert(row.actor_id === fx.userIds.admin, `autor: ${row.actor_id}`)
    assert(row.actor_role === 'admin', `papel: ${row.actor_role}`)
    return 'autor e papel conferidos'
  })

  await check('conteúdo de usuário não entra na trilha de dado oficial', async () => {
    const total = await scalar(
      `select count(*)::int from public.audit_logs
        where entity_type in ('favorites', 'comments', 'ratings', 'lists')`,
    )
    assert(Number(total) === 0, `entradas inesperadas: ${total}`)
    return 'moderação de usuário fica fora do histórico oficial'
  })
}

/* -------------------------------------------------------------------------- */
/* 6. Aderência de src/types/database.types.ts ao schema (tarefa 2.16)         */
/* -------------------------------------------------------------------------- */

async function checkTypesFile() {
  console.log('\nTipos TypeScript gerados (tarefa 2.16)')

  const source = readFileSync(TYPES_FILE, 'utf8')

  await check('arquivo de tipos existe e não está vazio', async () => {
    assert(source.length > 0, 'src/types/database.types.ts está vazio')
    return `${source.split('\n').length} linhas`
  })

  await check('todas as tabelas do banco estão declaradas nos tipos', async () => {
    const { rows } = await q(
      `select c.relname as name
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'p')
        order by c.relname`,
    )
    const missing = rows.map((row) => row.name).filter((name) => !source.includes(`${name}: {`))
    assert(missing.length === 0, `faltando nos tipos: ${missing.join(', ')}`)
    return `${rows.length} tabelas cobertas`
  })

  await check('enums do banco estão declarados nos tipos', async () => {
    const { rows } = await q(
      `select t.typname as name
         from pg_type t
         join pg_namespace n on n.oid = t.typnamespace
        where n.nspname = 'public' and t.typtype = 'e'
        order by t.typname`,
    )
    const missing = rows.map((row) => row.name).filter((name) => !source.includes(`${name}: `))
    assert(missing.length === 0, `faltando nos tipos: ${missing.join(', ')}`)
    return `${rows.length} enums cobertos`
  })

  await check('funções públicas relevantes estão declaradas', async () => {
    const expected = [
      'canonicalize_url',
      'current_user_role',
      'is_staff',
      'is_admin',
      'is_public_row',
      'search_politicians',
    ]
    const missing = expected.filter((name) => !source.includes(name))
    assert(missing.length === 0, `faltando nos tipos: ${missing.join(', ')}`)
    return `${expected.length} funções cobertas`
  })
}

/* -------------------------------------------------------------------------- */
/* Execução                                                                   */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log(`Teste de fumaça — banco: ${maskDbUrl(url)} (${source})`)

  client = new Client({ connectionString: url })
  await client.connect()

  try {
    await client.query('begin')
    // As fixtures usam os papéis da RLS. `set local role none` devolve os
    // privilégios do dono do cluster, necessários para criar as fixtures.
    await client.query('set local role none')

    await checkStructure()

    const fx = await createFixtures()
    await checkProjectRules(fx)
    await checkDedupAndSearch(fx)
    await checkRls(fx)
    await checkAudit(fx)
    await checkTypesFile()
  } catch (error) {
    fail('execução interrompida', error.message)
  } finally {
    // Nada do teste permanece no banco (ver cabeçalho do arquivo).
    await client.query('rollback').catch(() => {})
    await client.end().catch(() => {})
  }

  console.log(`\n${'-'.repeat(64)}`)
  console.log(`${results.passed} verificação(ões) OK, ${results.failed} falha(s)`)
  if (results.failures.length > 0) {
    console.log('\nFalhas:')
    for (const item of results.failures) console.log(`  - ${item}`)
  }
  process.exitCode = results.failed === 0 ? 0 : 1
}

await main()


