/**
 * Catálogo das fontes oficiais que a plataforma pretende consultar.
 *
 * IMPORTANTE
 * - As URLs deste arquivo são as páginas institucionais dos órgãos.
 * - Ao registrar um dado real (FASE 04 em diante), a coleta deve guardar a URL
 *   EXATA da página/arquivo consultado e a data da coleta. Este catálogo não
 *   substitui esse registro.
 * - Nenhuma informação deste arquivo é dado político; são apenas referências
 *   de órgãos públicos.
 */

/** Esfera administrativa da fonte. */
export type SourceScope = "federal" | "estadual" | "municipal";

/** Natureza do órgão que publica a informação. */
export type SourceKind =
  | "eleitoral"
  | "legislativo"
  | "executivo"
  | "controle"
  | "transparencia"
  | "diario_oficial";

export interface OfficialSource {
  /** Identificador estável usado no banco de dados e nas URLs internas. */
  readonly id: string;
  readonly name: string;
  readonly acronym: string;
  readonly scope: SourceScope;
  /** UF de atuação; `null` quando a fonte é nacional. */
  readonly state: string | null;
  readonly kind: SourceKind;
  /** Página institucional oficial. */
  readonly url: string;
  /** Portal de dados abertos/API, quando existir e for conhecido. */
  readonly dataUrl?: string;
  /** Tipos de informação que a fonte publica (descrição neutra). */
  readonly provides: readonly string[];
  /** Cuidados de uso ao coletar desta fonte. */
  readonly note?: string;
}

export const officialSources: readonly OfficialSource[] = [
  {
    id: "tse",
    name: "Tribunal Superior Eleitoral",
    acronym: "TSE",
    scope: "federal",
    state: null,
    kind: "eleitoral",
    url: "https://www.tse.jus.br",
    dataUrl: "https://dadosabertos.tse.jus.br",
    provides: [
      "Candidaturas registradas em eleições",
      "Resultados oficiais de eleições",
      "Prestação de contas de campanha",
      "Filiação partidária",
    ],
    note: "Fonte primária para cargo pleiteado, partido e situação de candidatura.",
  },
  {
    id: "tre-sp",
    name: "Tribunal Regional Eleitoral de São Paulo",
    acronym: "TRE-SP",
    scope: "estadual",
    state: "SP",
    kind: "eleitoral",
    url: "https://www.tre-sp.jus.br",
    provides: [
      "Registros de candidatura no estado de São Paulo",
      "Prestação de contas de campanhas estaduais",
      "Decisões eleitorais publicadas",
    ],
  },
  {
    id: "camara-deputados",
    name: "Câmara dos Deputados",
    acronym: "Câmara",
    scope: "federal",
    state: null,
    kind: "legislativo",
    url: "https://www.camara.leg.br",
    dataUrl: "https://dadosabertos.camara.leg.br",
    provides: [
      "Projetos apresentados e sua tramitação",
      "Votações em plenário e comissões",
      "Cota para exercício da atividade parlamentar (despesas)",
      "Discursos e presença em eventos",
    ],
    note: "A Câmara publica API de dados abertos; a coleta deve registrar o endpoint consultado.",
  },
  {
    id: "senado-federal",
    name: "Senado Federal",
    acronym: "Senado",
    scope: "federal",
    state: null,
    kind: "legislativo",
    url: "https://www12.senado.leg.br",
    dataUrl: "https://legis.senado.leg.br/dadosabertos",
    provides: [
      "Proposições legislativas e tramitação",
      "Votações nominais e simbólicas",
      "Despesas de gabinete e auxílios",
      "Atividade parlamentar publicada",
    ],
  },
  {
    id: "alesp",
    name: "Assembleia Legislativa do Estado de São Paulo",
    acronym: "ALESP",
    scope: "estadual",
    state: "SP",
    kind: "legislativo",
    url: "https://www.al.sp.gov.br",
    provides: [
      "Projetos de lei e demais proposições estaduais",
      "Tramitação e pareceres das comissões",
      "Votações nominais em plenário",
      "Despesas da atividade parlamentar",
    ],
    note: "Fonte primária para deputados estaduais de São Paulo.",
  },
  {
    id: "governo-sp",
    name: "Governo do Estado de São Paulo",
    acronym: "Governo SP",
    scope: "estadual",
    state: "SP",
    kind: "executivo",
    url: "https://www.sp.gov.br",
    provides: [
      "Programas e obras anunciados pelo Poder Executivo estadual",
      "Atos oficiais e decretos publicados",
    ],
  },
  {
    id: "transparencia-sp",
    name: "Portal da Transparência do Estado de São Paulo",
    acronym: "Transparência SP",
    scope: "estadual",
    state: "SP",
    kind: "transparencia",
    url: "https://www.transparencia.sp.gov.br",
    provides: [
      "Despesas e pagamentos do Executivo estadual",
      "Remuneração de agentes públicos",
      "Convênios, contratos e transferências",
    ],
  },
  {
    id: "transparencia-federal",
    name: "Portal da Transparência do Governo Federal",
    acronym: "Transparência Federal",
    scope: "federal",
    state: null,
    kind: "transparencia",
    url: "https://portaldatransparencia.gov.br",
    provides: [
      "Emendas parlamentares e beneficiários",
      "Transferências de recursos a estados e municípios",
      "Remuneração de agentes públicos federais",
    ],
  },
  {
    id: "tce-sp",
    name: "Tribunal de Contas do Estado de São Paulo",
    acronym: "TCE-SP",
    scope: "estadual",
    state: "SP",
    kind: "controle",
    url: "https://www.tce.sp.gov.br",
    provides: [
      "Pareceres e decisões sobre contas públicas",
      "Fiscalizações e relatórios de auditoria",
      "Processos e licitações fiscalizadas",
    ],
    note: "Os dados são de julgamento de contas; cada decisão deve ser citada com o número do processo.",
  },
  {
    id: "tcm-sp",
    name: "Tribunal de Contas do Município de São Paulo",
    acronym: "TCM-SP",
    scope: "municipal",
    state: "SP",
    kind: "controle",
    url: "https://www.tcm.sp.gov.br",
    provides: [
      "Pareceres sobre contas da administração municipal paulistana",
      "Relatórios de fiscalização municipais",
    ],
    note: "Competência restrita ao município de São Paulo, conforme definida pelo próprio órgão.",
  },
  {
    id: "diario-oficial-sp",
    name: "Imprensa Oficial do Estado de São Paulo",
    acronym: "Diário Oficial SP",
    scope: "estadual",
    state: "SP",
    kind: "diario_oficial",
    url: "https://www.imprensaoficial.com.br",
    provides: [
      "Publicações oficiais do estado de São Paulo",
      "Atos, nomeações e decretos publicados",
    ],
  },
  {
    id: "camara-municipal-sp",
    name: "Câmara Municipal de São Paulo",
    acronym: "CMSP",
    scope: "municipal",
    state: "SP",
    kind: "legislativo",
    url: "https://www.saopaulo.sp.leg.br",
    provides: [
      "Projetos de lei e requerimentos municipais",
      "Votações e sessões da Câmara Municipal",
      "Cota para atividade parlamentar dos vereadores",
    ],
  },
  {
    id: "prefeitura-sao-paulo",
    name: "Prefeitura do Município de São Paulo",
    acronym: "PMSP",
    scope: "municipal",
    state: "SP",
    kind: "executivo",
    url: "https://prefeitura.sp.gov.br",
    provides: [
      "Obras, programas e serviços municipais",
      "Atos oficiais e decretos do município",
      "Orçamento e execução orçamentária municipal",
    ],
  },
] as const;

/** Busca uma fonte pelo identificador; `undefined` se não existir no catálogo. */
export function getOfficialSource(id: string): OfficialSource | undefined {
  return officialSources.find((source) => source.id === id);
}

/** Lista as fontes de uma esfera administrativa. */
export function getOfficialSourcesByScope(scope: SourceScope): OfficialSource[] {
  return officialSources.filter((source) => source.scope === scope);
}
