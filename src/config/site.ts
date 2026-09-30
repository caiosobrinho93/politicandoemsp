/**
 * Configuração institucional da plataforma.
 *
 * Aqui ficam apenas textos institucionais e regras de escopo. Dados políticos
 * NUNCA são definidos neste arquivo (eles vêm das fontes oficiais coletadas com
 * registro de origem).
 */

export const siteConfig = {
  name: "PolíticaSP",
  shortName: "PolíticaSP",
  /** Frase institucional obrigatória na página inicial. */
  tagline: "Conheça os fatos. Consulte as fontes. Tire suas próprias conclusões.",
  description:
    "Plataforma de consulta a informações públicas e verificáveis sobre políticos, autoridades e candidatos. Dados oficiais separados de notícias, declarações e opiniões, sempre com a fonte original.",
  /** Escopo inicial do projeto; o modelo de dados já prevê expansão nacional. */
  scope: {
    country: "Brasil",
    countryCode: "BR",
    state: "São Paulo",
    stateCode: "SP",
    expansionNote:
      "A plataforma inicia por São Paulo e o modelo de dados usa códigos de UF, permitindo expansão para outros estados sem reescrever a estrutura.",
  },
} as const;

/**
 * Avisos legais e de imparcialidade exibidos no rodapé e nas páginas explicativas.
 * São parte das regras inegociáveis do projeto (ver PROJECT_REQUIREMENTS.md).
 */
export const institutionalNotices = {
  impartiality:
    "Esta plataforma não recomenda voto e não compara políticos com juízo de valor. Ela organiza informações públicas para que cada pessoa tire suas próprias conclusões.",
  sources:
    "Todo dado factual exibido deve indicar a fonte original. Informação sem fonte verificada não é publicada.",
  evidenceSeparation:
    "Dados oficiais, notícias, declarações e opiniões são exibidos em blocos separados e identificados. Notícia não é prova de fato.",
  corrections:
    "Encontrou um erro? Qualquer pessoa pode sugerir correção com link da fonte. Toda alteração fica registrada em histórico público auditável.",
  political_neutrality:
    "A plataforma não possui vínculo com partido, candidato, governo ou entidade ideológica.",
} as const;
