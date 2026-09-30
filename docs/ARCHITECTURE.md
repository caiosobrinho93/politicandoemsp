# Arquitetura

Documento técnico do projeto. Explica **como** o código está organizado e **por que** as decisões
foram tomadas. O plano de execução por fases está em [`../PROJECT_REQUIREMENTS.md`](../PROJECT_REQUIREMENTS.md).

---

## 1. Princípios que moldam a arquitetura

| Princípio | Consequência técnica |
| --- | --- |
| Nenhum dado inventado | Componentes recebem dados por props; nenhum conteúdo factual é escrito dentro de componente. Estado vazio é um componente de primeira classe (`EmptyState`, `MissingData`). |
| Fonte obrigatória | Todo tipo factual (`Politician`, `Mandate`, `Project`, `Expense`, `PublicFund`, `NewsArticle`) declara `sources: readonly SourceRef[]` (ou `source: SourceRef`). Sem fonte, o registro não é publicável. |
| Origem da informação visível | Categoria de origem centralizada em `src/lib/evidence.ts`; exibição via `EvidenceBadge` / `EvidenceLegend`. |
| Separação dado oficial × usuário | Tipos de conteúdo de usuário (`Comment`, `Rating`, `UserList`, `RankingSnapshot.isUserRanking`) são estruturalmente separados das entidades oficiais. |
| Mobile-first | Classes Tailwind em ordem crescente (`sm:`, `lg:`), alvos de toque `min-h-11`, tabelas dentro de `overflow-x-auto`. |
| Sóbrio e acessível | Paleta neutra em tokens, foco visível global, `prefers-reduced-motion`, sem bibliotecas de animação. |

---

## 2. Estrutura de pastas

```
src/app/          rotas (App Router, Server Components por padrão)
src/components/   apresentação reutilizável, sem acesso a dados
src/config/       textos institucionais, navegação e catálogo de fontes
src/lib/          regras de domínio puras (selos, formatação) e utilitários
src/types/        tipos de domínio (contrato com o banco da FASE 02)
supabase/         migrações e políticas de RLS (a partir da FASE 02)
docs/             esta documentação
```

### `src/app`
Cada pasta é uma rota pública. As páginas são **Server Components**; o único componente cliente é
`components/layout/nav-links.tsx`, que usa `usePathname()` para marcar `aria-current="page"`.

### `src/components`
- `ui/`: blocos neutros (`Container`, `Section`, `Card`, `Badge`, `StatusTag`, `EmptyState`,
  `PageHeader`, `Disclosure`, `ExternalSourceLink`, `LinkButton`). Nenhum conhece entidades de domínio.
- `evidence/`: apresentação dos selos de origem (`EvidenceBadge`, `MissingData`, `EvidenceLegend`).
- `layout/`: `SiteHeader`, `SiteFooter`, `NavLinks` e `StageNotice` (aviso de base em coleta).

### `src/config`
- `site.ts`: nome, frase institucional, escopo (UF) e avisos legais/institucionais.
- `navigation.ts`: itens da navegação principal, usados por header, footer e 404.
- `sources.ts`: catálogo das fontes oficiais (órgão, esfera, tipo, URL, o que publica, cuidados de uso).

### `src/lib`
- `evidence.ts`: definição canônica das categorias de origem e rótulo de dado ausente.
- `format.ts`: formatação pt-BR de data, moeda, número e percentual. Retorna `null` quando não há
  valor, para que a interface use o rótulo de dado ausente em vez de exibir `0`.
- `utils.ts`: composição de classes CSS.

### `src/types`
`domain.ts` descreve as entidades previstas (políticos, partidos, mandatos, projetos, votações,
despesas, verbas/emendas, notícias, linha do tempo, conteúdo de usuário, rankings, auditoria).
São usados agora como contrato de UI e serão espelhados nas migrações da FASE 02.

---

## 3. Decisões técnicas registradas

1. **Tailwind CSS v4 com tokens em CSS.** Cores de selo e da identidade vivem em `@theme` no
   `globals.css`, gerando utilitários (`text-tag-fato`, `bg-brand-50`). Não existe arquivo
   `tailwind.config.js`.
2. **Sem fonte remota.** A tipografia usa a pilha de fontes do sistema para não depender de rede
   durante o build. Um ajuste para `next/font` pode ser feito quando houver identidade visual definida.
3. **Sem biblioteca de componentes de terceiros.** Os componentes base são próprios, pequenos e
   auditáveis, evitando dependências que trazem estilo opinativo e peso.
4. **Sem `clsx`/`tailwind-merge`.** A composição de classes é feita por um utilitário local (`cn`),
   suficiente porque as classes passadas por props não conflitam.
5. **`<details>` nativo** para conteúdo expansível (`Disclosure`), evitando estado de cliente.
6. **Datas honestas.** Datas civis (`AAAA-MM-DD`) são exibidas como enviadas pela fonte (sem
   conversão de fuso, que trocaria o dia); timestamps são formatados no fuso de Brasília.
7. **Rotas-esqueleto publicadas.** `/politicos`, `/comparar`, `/rankings`, `/noticias` existem e
   explicam o que faltará até a coleta — em vez de retornar 404 e parecer erro.
8. **`MISSING_DATA_LABEL` = "Não coletado".** Vocabulário único para ausência de dado em toda a
   plataforma.

---

## 4. Fluxo de dados previsto (a partir da FASE 02)

```
fonte oficial → coleta registrada (URL + data) → tabela `sources`
              → tabela específica (ex.: `projects`, `expenses`) com FK para a fonte
              → consulta no servidor (Server Component / route handler)
              → componente de apresentação + EvidenceBadge + ExternalSourceLink
```

Regras que o banco vai reforçar: RLS de leitura pública apenas para conteúdo verificado, escrita
restrita a papéis `moderator`/`admin`, e trilha de auditoria (`audit_logs`) para toda alteração.

---

## 5. Convenções de código

- TypeScript estrito; tipos de domínio em `src/types/domain.ts`; props tipadas em `interface`.
- Nomes de arquivos e pastas de componentes em `kebab-case`; componentes exportados em `PascalCase`.
- Comentários e textos de interface em português (pt-BR); identificadores de código em inglês.
- Todo texto exibido ao usuário deve ser explicativo e neutro: descreve o dado, não julga a pessoa.
- Antes de adicionar dependência, verificar se ela é realmente necessária (o projeto prioriza
  poucas dependências).
- Toda tarefa concluída é marcada em `PROJECT_REQUIREMENTS.md` com registro no log de execução.
