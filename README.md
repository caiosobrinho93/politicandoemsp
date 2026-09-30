# PolíticaSP

Plataforma web de consulta a **informações públicas e verificáveis** sobre políticos, autoridades e
candidatos. Escopo inicial: **São Paulo (SP)**, com estrutura preparada para expansão nacional.

> **Conheça os fatos. Consulte as fontes. Tire suas próprias conclusões.**

A plataforma não recomenda voto, não calcula nota de "melhor político" e não publica opinião própria
sobre pessoas. Ela organiza fatos, dados oficiais, notícias, declarações e opiniões — sempre
separados, identificados e com a fonte original.

---

## Regras inegociáveis do projeto

1. **Nada de dado inventado.** Nenhum nome, número, data, valor ou cargo é estimado, completado ou
   usado como exemplo ilustrativo.
2. **Fonte para todo dado factual.** Órgão de origem + URL exata + data de coleta.
3. **Separação de origem da informação.** `FATO`, `DADO OFICIAL`, `NOTÍCIA`,
   `DECLARAÇÃO DO POLÍTICO`, `OPINIÃO/ANÁLISE` são categorias distintas no modelo de dados e na
   interface.
4. **Notícia não é prova de fato.** É relato de terceiro, exibido com link original.
5. **Sem recomendação de voto.** Ranking apenas por critério objetivo, com metodologia e fontes
   visíveis.
6. **Conteúdo de usuário nunca se mistura a dado oficial.** Comentários, avaliações e rankings de
   usuários aparecem em blocos separados e identificados.
7. **Dado ausente é exibido como ausente** (`Não coletado`) — nunca como zero ou estimativa.

O detalhamento de todas as regras e a lista de fases do projeto estão em
[`PROJECT_REQUIREMENTS.md`](./PROJECT_REQUIREMENTS.md), que é a fonte oficial de tarefas.

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Aplicação | Next.js (App Router) + React + TypeScript |
| Estilo | Tailwind CSS v4 (tokens em `src/app/globals.css`) |
| Banco/Auth | Supabase (PostgreSQL, Auth, RLS) — FASE 02 em diante |
| Deploy | Vercel |

---

## Estrutura de pastas

```
src/
├─ app/                  # rotas e layout (App Router)
│  ├─ layout.tsx         # html lang="pt-BR", header, footer, skip link
│  ├─ page.tsx           # página inicial
│  ├─ politicos/         # /politicos
│  ├─ comparar/          # /comparar
│  ├─ rankings/          # /rankings
│  ├─ noticias/          # /noticias
│  ├─ sobre/             # /sobre (metodologia, fontes, limitações)
│  └─ not-found.tsx      # 404
├─ components/
│  ├─ layout/            # header, footer, navegação, aviso de estágio
│  ├─ ui/                # componentes base (Container, Card, Badge, ...)
│  └─ evidence/          # selos de origem da informação
├─ config/               # navegação, textos institucionais e fontes oficiais
├─ lib/                  # regras de selos, formatação pt-BR e utilitários
└─ types/                # tipos de domínio (entidades previstas)
supabase/                # migrações do banco (a partir da FASE 02)
docs/                    # documentação técnica
```

Detalhes de decisões e convenções: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## Rodando o projeto

```bash
npm install
npm run dev    # http://localhost:3000
npm run lint   # ESLint (eslint-config-next)
npm run build  # build de produção
```

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com as credenciais do seu projeto Supabase.
Enquanto as variáveis estiverem vazias, a aplicação funciona normalmente com as áreas de dados
vazias — nada é inventado para preencher a tela.

Nunca use a chave `service_role` em variáveis `NEXT_PUBLIC_*`.

---

## Estado atual (FASE 01 concluída)

- [x] Estrutura inicial, design tokens e layout institucional mobile-first.
- [x] Componentes base e selos epistêmicos reutilizáveis.
- [x] Páginas de consulta publicadas com **estado vazio explícito**.
- [x] Tipos de domínio e catálogo de fontes oficiais.
- [ ] Coleta de dados reais com fonte (FASE 04 em diante).
- [ ] Banco de dados, autenticação, rankings, moderação e painel administrativo.

Enquanto as fases de coleta não forem executadas, **nenhum dado político real é exibido**.

---

## Mobile-first e acessibilidade

Todo componente é projetado primeiro para telas de 360–430px. O projeto adota contraste AA, foco
visível para teclado, alvos de toque de no mínimo 44px, `lang="pt-BR"`, hierarquia de títulos
correta e animações mínimas (respeitando `prefers-reduced-motion`).
