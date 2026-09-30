/**
 * Navegação principal da plataforma.
 *
 * Os itens ficam aqui (e não dentro dos componentes) para que o cabeçalho, o
 * rodapé e as páginas explicativas usem exatamente a mesma lista.
 *
 * Observação de fase: todas as rotas listadas já existem como página-esqueleto
 * que exibe estado vazio enquanto não houver dado coletado com fonte.
 */

export const mainNavigation = [
  {
    href: "/politicos",
    label: "Políticos",
    description: "Perfis com mandatos, projetos, votações, gastos e fontes.",
  },
  {
    href: "/comparar",
    label: "Comparar",
    description: "Comparação lado a lado de dados objetivos, sem conclusões automáticas.",
  },
  {
    href: "/rankings",
    label: "Rankings",
    description: "Critérios objetivos com metodologia e origem dos dados visíveis.",
  },
  {
    href: "/noticias",
    label: "Notícias",
    description: "Relatos de imprensa identificados como notícia, com link original.",
  },
  {
    href: "/sobre",
    label: "Sobre",
    description: "Metodologia, fontes utilizadas e limitações da plataforma.",
  },
] as const;

export type NavigationItem = (typeof mainNavigation)[number];
