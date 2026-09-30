# PROJECT_REQUIREMENTS.md

> **Fonte oficial de tarefas do projeto.** Nenhuma tarefa é considerada feita sem estar marcada aqui.
> Regra de execução: **uma fase por vez**, nunca pular tarefa, sempre manter o projeto funcionando.
> Fluxo por tarefa: (1) implementar → (2) testar → (3) corrigir erros → (4) marcar no checkbox →
> (5) registrar no "Log de execução" → (6) só então iniciar a próxima tarefa.

---

## 0. Identidade do projeto

| Item | Definição |
| --- | --- |
| Nome provisório | PolíticaSP (plataforma de análise política transparente) |
| Escopo inicial | Estado de São Paulo (arquitetura preparada para expansão nacional) |
| Frase institucional | **"Conheça os fatos. Consulte as fontes. Tire suas próprias conclusões."** |
| Stack | Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL, Auth, RLS) + Vercel |
| Público | Cidadão comum, jornalista, pesquisador, estudante |

### 0.1 Regras inegociáveis (valem para todas as fases)

- [x] **R0.1** Nunca inventar dados políticos, nomes, números, cargos, datas ou valores.
- [x] **R0.2** Nunca preencher informação desconhecida com valor fictício ou "placeholder de aparência real".
- [x] **R0.3** Todo dado factual exibido deve ter **fonte** (instituição + URL + data de coleta).
- [x] **R0.4** Diferenciar no modelo de dados e na interface: `FATO`, `DADO OFICIAL`, `NOTÍCIA`,
      `DECLARAÇÃO DO POLÍTICO`, `OPINIÃO/ANÁLISE`.
- [x] **R0.5** Notícia isolada não é prova de fato; é sempre exibida como `NOTÍCIA` (relato de terceiro).
- [x] **R0.6** Nenhuma conclusão política automática; nenhum "melhor político" opinativo gerado por IA.
- [x] **R0.7** Ranking só por critério objetivo, com metodologia e origem dos dados visíveis.
- [x] **R0.8** Conteúdo de usuário (comentário, avaliação, ranking próprio, lista) nunca se mistura com
      dados oficiais na interface.
- [x] **R0.9** Quando a informação não existe ou não foi coletada, exibir estado vazio explícito — nunca dado fabricado.
- [x] **R0.10** Nada de linguagem sensacionalista, adjetivos valorativos ou juízo sobre pessoas.

### 0.2 Prioridade: mobile-first, acessível, sóbrio

- [x] **R0.11** Todo componente é projetado primeiro para telas pequenas (360–430px) e ampliado depois.
- [x] **R0.12** Contraste AA, foco visível por teclado, alvos de toque ≥ 44px, texto legível sem zoom.
- [x] **R0.13** Animações mínimas (apenas transições utilitárias curtas); nada de efeitos decorativos.
- [x] **R0.14** Design limpo, sério e confiável; dados em tabelas e gráficos legíveis; sem "marketing visual".

---

## 1. Fases de execução

### [x] FASE 01 — Estrutura inicial
Objetivo: projeto Next.js funcionando com design system base, layout institucional, tipos de domínio e
catálogo de fontes. **Sem dados reais e sem banco de dados ainda.**

- [x] 1.1 Scaffold Next.js + TypeScript + Tailwind CSS + ESLint (App Router, `src/`, alias `@/*`).
- [x] 1.2 Estrutura de pastas escalável (`app`, `components`, `lib`, `types`, `config`, `supabase`).
- [x] 1.3 Tokens de design (cores sóbrias, tipografia, espaçamento) em CSS + utilitários.
- [x] 1.4 Componentes base reutilizáveis: `Container`, `Section`, `Card`, `Badge`, `EmptyState`,
      `PageHeader`, `ExternalSourceLink`, `Disclosure`.
- [x] 1.5 Selos epistêmicos reutilizáveis (`FATO`, `DADO OFICIAL`, `NOTÍCIA`, `DECLARAÇÃO DO POLÍTICO`,
      `OPINIÃO/ANÁLISE`) — apenas rotulam a origem, sem interpretar conteúdo.
- [x] 1.6 Layout raiz (pt-BR, metadata, acessibilidade) com header institucional e navegação mobile-first.
- [x] 1.7 Footer com aviso de imparcialidade, política de fontes e ausência de recomendação de voto.
- [x] 1.8 Página inicial com a frase institucional e explicação das 5 categorias de informação
      (sem números, sem ranking e sem político fictício).
- [x] 1.9 Rotas-esqueleto das áreas previstas (`/politicos`, `/comparar`, `/rankings`, `/noticias`, `/sobre`)
      cada uma com `EmptyState` honesto ("nenhum dado coletado ainda").
- [x] 1.10 Tipos de domínio em TypeScript para as entidades previstas (sem banco conectado ainda).
- [x] 1.11 Catálogo de fontes oficiais em código (`src/config/sources.ts`) com nome, sigla, esfera, URL e tipo.
- [x] 1.12 `.env.example`, `.gitignore`, `README.md` e `docs/ARCHITECTURE.md`.
- [x] 1.13 Validação: `npm run lint` + `npm run build` + smoke test do servidor de desenvolvimento.
- [x] 1.14 Registrar execução no log deste arquivo.

### [x] FASE 02 — Banco de dados (Supabase/PostgreSQL)
- [x] 2.1 Projeto Supabase + variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [x] 2.2 Migração: `parties`.
- [x] 2.3 Migração: `politicians` (+ enums de cargo e esfera federativa).
- [x] 2.4 Migração: `mandates`.
- [x] 2.5 Migração: `projects`.
- [x] 2.6 Migração: `votes` + posições individuais de voto.
- [x] 2.7 Migração: `expenses` e `public_funds` (verbas/emendas).
- [x] 2.8 Migração: `sources` (transversal: instituição, URL, data de coleta).
- [x] 2.9 Migração: `news` (deduplicação por URL canônica).
- [x] 2.10 Migração: `timeline_events`.
- [x] 2.11 Migração: `profiles`, `favorites`, `lists`/`list_items`, `comments`, `ratings`, `reports`.
- [x] 2.12 Migração: `rankings` (definição + snapshot com metodologia).
- [x] 2.13 Migração: `audit_logs`.
- [x] 2.14 Índices para busca/filtros eficientes e busca textual (`pg_trgm`, `unaccent`).
- [x] 2.15 RLS: leitura pública apenas de conteúdo verificado; escrita restrita a `admin`/`moderator`.
- [x] 2.16 Tipos TypeScript gerados do banco (`database.types.ts`).
- [x] 2.17 Seed estrutural (somente catálogos oficiais: partidos, fontes, cargos) — sem político inventado.
- [x] 2.18 Validação: consultas de fumaça e teste de RLS.

### [ ] FASE 03 — Autenticação e papéis
- [ ] 3.1 Cliente Supabase (browser/server) + middleware de sessão.
- [ ] 3.2 Login, cadastro e recuperação de senha (Supabase Auth).
- [ ] 3.3 Tabela `profiles` ligada a `auth.users` com papéis `user`/`moderator`/`admin`.
- [ ] 3.4 Visitante × usuário logado: diferenças de interface e de permissão.
- [ ] 3.5 Página de perfil e configurações básicas.
- [ ] 3.6 Validação: fluxo completo testado.

### [ ] FASE 04 — Cadastro de políticos (dados reais com fonte)
- [ ] 4.1 CRUD administrativo de partidos.
- [ ] 4.2 CRUD administrativo de políticos (foto, nome, cargo, partido, biografia pública).
- [ ] 4.3 CRUD de mandatos e períodos.
- [ ] 4.4 Vínculo obrigatório de fonte por dado factual (bloquear publicação sem fonte).
- [ ] 4.5 Registro/importação auditável de dados da ALESP.
- [ ] 4.6 Registro/importação auditável de dados da Câmara dos Deputados.
- [ ] 4.7 Registro/importação auditável de dados do Senado Federal.
- [ ] 4.8 Registro/importação auditável de dados do TSE/TRE-SP.
- [ ] 4.9 Página pública do político (foto, cargo, partido, biografia, mandatos, fontes, linha do tempo).
- [ ] 4.10 Busca e filtros de políticos (nome, cargo, partido, esfera, estado).
- [ ] 4.11 Validação: dado de teste conferido linha a linha contra a fonte original.

### [ ] FASE 05 — Projetos, votações e atuação legislativa
- [ ] 5.1 Cadastro de projetos (tipo, número, ano, ementa, autoria, situação, link oficial).
- [ ] 5.2 Situação rastreável: apresentado → em tramitação → aprovado → sancionado/vetado → executado/entregue.
- [ ] 5.3 Cadastro de votações e posições individuais.
- [ ] 5.4 Indicadores de participação (presenças, votações, proposições).
- [ ] 5.5 Linha do tempo derivada de eventos oficiais.
- [ ] 5.6 Página do político: abas de projetos, votações e participação.
- [ ] 5.7 Validação: números conferidos contra as fontes oficiais.

### [ ] FASE 06 — Gastos, verbas e emendas
- [ ] 6.1 Cadastro de despesas (cota parlamentar, gabinete, diárias, passagens).
- [ ] 6.2 Cadastro de emendas e repasses (`public_funds`).
- [ ] 6.3 Contratos e convênios públicos vinculados.
- [ ] 6.4 Visualizações em tabelas e gráficos, sempre com origem por fonte.
- [ ] 6.5 Avisos de contexto (período e órgão pagador de cada valor).
- [ ] 6.6 Validação: soma e período conferidos contra o portal de origem.

### [ ] FASE 07 — Notícias e declarações
- [ ] 7.1 Provedor de busca/API de notícias configurável por variável de ambiente.
- [ ] 7.2 Coleta por político com título, fonte, data, link original e resumo.
- [ ] 7.3 Deduplicação (URL canônica + similaridade de título).
- [ ] 7.4 Classificação por categoria e vínculo com o político.
- [ ] 7.5 Rotulagem obrigatória: `NOTÍCIA` (relato de terceiro) × `DECLARAÇÃO DO POLÍTICO` (fala própria).
- [ ] 7.6 Curadoria humana antes da publicação.
- [ ] 7.7 Validação: links originais acessíveis e dados conferidos.

### [ ] FASE 08 — Comparador
- [ ] 8.1 Seleção de 2+ políticos (busca, chips, colunas roláveis no mobile).
- [ ] 8.2 Comparação lado a lado: cargo, partido, mandatos, projetos, aprovados, participação, gastos, emendas, notícias, fontes.
- [ ] 8.3 Célula ausente explícita ("não coletado"), sem inferência.
- [ ] 8.4 Nenhuma conclusão ou recomendação automática.
- [ ] 8.5 Compartilhamento da comparação por URL.
- [ ] 8.6 Validação: teste com dados reais e com dado ausente.

### [ ] FASE 09 — Rankings objetivos e rankings de usuário
- [ ] 9.1 Motor de ranking por critério objetivo (projetos apresentados, aprovados, participação, gastos, emendas, atividade).
- [ ] 9.2 Página de metodologia com fórmula, período, fonte e limitações.
- [ ] 9.3 Snapshot versionado de cada ranking calculado.
- [ ] 9.4 Rankings criados por usuário, marcados como **OPINIÃO DO USUÁRIO**.
- [ ] 9.5 Separação visual obrigatória entre ranking objetivo e ranking de usuário.
- [ ] 9.6 Validação: recálculo reproduzível.

### [ ] FASE 10 — Área do usuário
- [ ] 10.1 Favoritar políticos.
- [ ] 10.2 Comparações salvas.
- [ ] 10.3 Listas personalizadas.
- [ ] 10.4 Comentários com estado de moderação.
- [ ] 10.5 Avaliações (marcadas como opinião).
- [ ] 10.6 Sugestão de correção de informação com fonte obrigatória.
- [ ] 10.7 Validação: permissões por papel testadas.

### [ ] FASE 11 — Moderação e denúncias
- [ ] 11.1 Fila de moderação de comentários (aprovar/reprovar/ocultar).
- [ ] 11.2 Denúncia de conteúdo pelo usuário.
- [ ] 11.3 Fluxo de sugestões de correção (aceitar → aplicar → registrar no histórico).
- [ ] 11.4 Registro das decisões de moderação com justificativa.
- [ ] 11.5 Validação: papéis e trilhas de auditoria conferidos.

### [ ] FASE 12 — Painel administrativo
- [ ] 12.1 Dashboard de pendências (dados sem fonte, notícias a revisar, denúncias).
- [ ] 12.2 CRUD de políticos, partidos, mandatos, projetos, votações, gastos, emendas e notícias.
- [ ] 12.3 Gestão de fontes e de categorias.
- [ ] 12.4 Gestão de usuários e papéis.
- [ ] 12.5 Histórico/versionamento de toda alteração importante (`audit_logs`).
- [ ] 12.6 Visualização de logs com filtros.
- [ ] 12.7 Validação: restaurar versão anterior de um registro.

### [ ] FASE 13 — Interface, acessibilidade e desempenho
- [ ] 13.1 Auditoria mobile-first tela por tela.
- [ ] 13.2 Acessibilidade WCAG 2.1 AA (contraste, foco, semântica, ARIA).
- [ ] 13.3 Gráficos e tabelas acessíveis com alternativa textual.
- [ ] 13.4 Metas de Core Web Vitals e otimização de consultas.
- [ ] 13.5 SEO básico e dados estruturados na página do político.

### [ ] FASE 14 — Deploy, testes e governança
- [ ] 14.1 Deploy na Vercel com variáveis de ambiente.
- [ ] 14.2 Testes automatizados dos fluxos críticos.
- [ ] 14.3 Página de transparência (metodologia, limitações, como reportar erro).
- [ ] 14.4 Termos de uso e política de privacidade (LGPD).
- [ ] 14.5 Revisão final contra todas as regras inegociáveis (R0.1–R0.14).

---

## 2. Log de execução

| Data | Fase/Tarefa | O que foi feito | Validação |
| --- | --- | --- | --- |
| 2026-09-30 | FASE 01 (1.1–1.14) | Scaffold Next.js 16 + TS + Tailwind 4 + ESLint; estrutura de pastas; tokens de design; componentes base e selos epistêmicos; layout com header/footer institucional; home com a frase institucional; rotas-esqueleto com estado vazio honesto; tipos de domínio; catálogo de fontes oficiais; `.env.example`; README e `docs/ARCHITECTURE.md`. | `npm run lint`: 0 problemas. `npm run build`: compilado, TypeScript sem erros, 7 rotas estáticas (`/`, `/_not-found`, `/comparar`, `/noticias`, `/politicos`, `/rankings`, `/sobre`). Smoke test de `npm run start`: HTTP 200 em todas as áreas, 404 na rota inexistente, frase institucional e `lang="pt-BR"` presentes no HTML. Repositório git inicializado com os 44 arquivos do projeto preparados para commit (identidade do git não configurada na máquina — commit pendente). |

| 2026-09-30 | FASE 02 (2.1–2.18) | 15 migrações (`supabase/migrations/0001`–`0015`) cobrindo fontes, partidos, políticos, mandatos, projetos, votações, gastos/verbas, notícias, linha do tempo, conteúdo de usuário, rankings, auditoria, índices/busca e RLS; extensões no schema `extensions` (portátil entre Supabase e PostgreSQL local); regras inegociáveis impostas no próprio banco (publicar exige fonte, despesa só em mês de competência, valor não negativo, nota de 1 a 5, ranking de usuário exige autor); seed apenas com catálogo oficial de fontes; `src/types/database.types.ts` gerado do schema; ferramentas `scripts/db/` (cluster local com `embedded-postgres`, `apply`, `generate-types`, `smoke-test`) e correção do `grant usage on schema extensions`, sem o qual a busca falhava com `permission denied` para `anon`/`authenticated`. | `node scripts/db/smoke-test.mjs`: **42/42 verificações OK, 0 falhas** — 27 tabelas, 16 enums, RLS em todas as tabelas com política, 5 índices trigram, 11 regras inegociáveis, deduplicação por URL canônica, busca sem acento que não expõe rascunho, RLS por papel (anon/user/moderator/admin), isolamento de favoritos/listas, comentário só visível após moderação, trilha de auditoria com autor/papel/estado anterior e posterior, e aderência dos tipos ao schema. Pipeline completo do zero (`reset` → `apply --seed` → `smoke-test`) com exit 0. |

---

## 3. Notas de escopo

- Dados reais entram apenas nas fases 04–07, sempre com fonte declarada. Até lá, a interface mostra estado vazio.
- A expansão nacional reaproveita o campo `state` (UF) presente em `politicians`/`mandates`, sem reescrever o modelo.
- Scraping de terceiros e IA generativa **não** são dependências do projeto.



