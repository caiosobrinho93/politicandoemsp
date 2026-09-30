/**
 * Tipos de domínio da plataforma.
 *
 * Estes tipos descrevem as entidades previstas no modelo de dados (FASE 02) e
 * já são usados na interface. Nenhum dado real é definido aqui — apenas a
 * estrutura.
 *
 * Regra estrutural (R0.3): toda entidade de caráter factual possui a lista
 * `sources` com as referências de origem (órgão + URL + data de coleta).
 */

/** Identificador no formato UUID v4 gerado pelo PostgreSQL. */
export type UUID = string;
/** Data civil no formato `AAAA-MM-DD`. */
export type IsoDate = string;
/** Data e hora no formato ISO 8601 com fuso. */
export type IsoDateTime = string;
/** Valor monetário em reais, sem formatação (ex.: `1234.56`). */
export type BrlAmount = number;
/** Sigla de unidade federativa (ex.: `SP`, `RJ`) — permite expansão nacional. */
export type StateCode = string;

/** Referência de origem de uma informação exibida na plataforma. */
export interface SourceRef {
  readonly id: UUID;
  /** Fonte oficial do catálogo (`src/config/sources.ts`), quando aplicável. */
  readonly officialSourceId?: string;
  /** Nome do veículo/órgão, exibido ao usuário. */
  readonly publisher: string;
  /** URL exata consultada (documento, página, endpoint ou matéria). */
  readonly url: string;
  /** Título do documento/matéria consultada. */
  readonly title?: string;
  /** Data da coleta pela plataforma (quando o dado foi obtido). */
  readonly collectedAt: IsoDateTime;
  /** Data de publicação/registro na origem, quando informada pela fonte. */
  readonly publishedAt?: IsoDateTime;
}

/* -------------------------------------------------------------------------- */
/* Cargos e esferas                                                           */
/* -------------------------------------------------------------------------- */

export type FederativeLevel = "federal" | "estadual" | "municipal";

export type PoliticalOffice =
  | "presidente"
  | "governador"
  | "senador"
  | "deputado_federal"
  | "deputado_estadual"
  | "deputado_distrital"
  | "prefeito"
  | "vice_prefeito"
  | "vereador";

export const POLITICAL_OFFICE_LABELS: Record<PoliticalOffice, string> = {
  presidente: "Presidente da República",
  governador: "Governador",
  senador: "Senador",
  deputado_federal: "Deputado Federal",
  deputado_estadual: "Deputado Estadual",
  deputado_distrital: "Deputado Distrital",
  prefeito: "Prefeito",
  vice_prefeito: "Vice-Prefeito",
  vereador: "Vereador",
};

export const POLITICAL_OFFICE_LEVEL: Record<PoliticalOffice, FederativeLevel> = {
  presidente: "federal",
  senador: "federal",
  deputado_federal: "federal",
  governador: "estadual",
  deputado_estadual: "estadual",
  deputado_distrital: "estadual",
  prefeito: "municipal",
  vice_prefeito: "municipal",
  vereador: "municipal",
};

/* -------------------------------------------------------------------------- */
/* Usuários e moderação                                                       */
/* -------------------------------------------------------------------------- */

export type UserRole = "user" | "moderator" | "admin";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: "Usuário",
  moderator: "Moderador",
  admin: "Administrador",
};

export type ModerationStatus = "pending" | "approved" | "rejected" | "hidden";

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: "Aguardando moderação",
  approved: "Aprovado",
  rejected: "Reprovado",
  hidden: "Ocultado",
};

export interface UserProfile {
  readonly id: UUID;
  /** Apelido público exibido nos comentários e avaliações. */
  readonly displayName: string;
  readonly role: UserRole;
  readonly createdAt: IsoDateTime;
}


/* -------------------------------------------------------------------------- */
/* Políticos, partidos e mandatos                                             */
/* -------------------------------------------------------------------------- */

export interface Party {
  readonly id: UUID;
  /** Sigla oficial conforme registro eleitoral (o valor vem da fonte). */
  readonly acronym: string;
  readonly name: string;
  /** Número de registro no TSE, quando publicado pela fonte. */
  readonly tseNumber?: string;
  readonly sources: readonly SourceRef[];
}

export interface Politician {
  readonly id: UUID;
  /** Nome civil/completo conforme a fonte. */
  readonly fullName: string;
  /** Nome público mais conhecido, se a fonte registra esse campo. */
  readonly publicName?: string;
  /** URL da foto publicada em fonte oficial (sem imagem gerada). */
  readonly photoUrl?: string;
  /** Cargo atual ou mais recente comprovado por fonte. */
  readonly office?: PoliticalOffice;
  readonly partyId?: UUID;
  readonly state?: StateCode;
  /** Município de atuação, quando o cargo for municipal. */
  readonly city?: string;
  /** Biografia redigida apenas com informação pública e citável. */
  readonly biography?: string;
  readonly sources: readonly SourceRef[];
}

export interface Mandate {
  readonly id: UUID;
  readonly politicianId: UUID;
  readonly office: PoliticalOffice;
  readonly level: FederativeLevel;
  /** Órgão/legislatura onde o mandato foi exercido (conforme a fonte). */
  readonly institution: string;
  readonly state?: StateCode;
  readonly city?: string;
  readonly startedAt: IsoDate;
  /** `null` quando a fonte indica mandato em curso ou não informa o fim. */
  readonly endedAt: IsoDate | null;
  readonly sources: readonly SourceRef[];
}

/* -------------------------------------------------------------------------- */
/* Atuação legislativa                                                        */
/* -------------------------------------------------------------------------- */

export type ProjectKind =
  | "projeto_de_lei"
  | "projeto_de_lei_complementar"
  | "proposta_de_emenda_constitucional"
  | "medida_provisoria"
  | "requerimento"
  | "indicacao"
  | "outro";

export const PROJECT_KIND_LABELS: Record<ProjectKind, string> = {
  projeto_de_lei: "Projeto de Lei",
  projeto_de_lei_complementar: "Projeto de Lei Complementar",
  proposta_de_emenda_constitucional: "Proposta de Emenda à Constituição",
  medida_provisoria: "Medida Provisória",
  requerimento: "Requerimento",
  indicacao: "Indicação",
  outro: "Outro tipo",
};

/**
 * Situação do projeto. A ordem abaixo é a sequência de tramitação prevista na
 * plataforma; cada mudança de situação deve vir com fonte e data.
 */
export type ProjectStatus =
  | "apresentado"
  | "em_tramitacao"
  | "aprovado"
  | "sancionado"
  | "vetado"
  | "arquivado"
  | "executado"
  | "entregue";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  apresentado: "Apresentado",
  em_tramitacao: "Em tramitação",
  aprovado: "Aprovado",
  sancionado: "Sancionado",
  vetado: "Vetado",
  arquivado: "Arquivado",
  executado: "Executado",
  entregue: "Entregue",
};

export interface Project {
  readonly id: UUID;
  readonly kind: ProjectKind;
  /** Identificação oficial, ex.: tipo + número + ano conforme a casa legislativa. */
  readonly officialCode?: string;
  readonly title: string;
  /** Ementa/resumo conforme redação oficial. */
  readonly summary: string;
  readonly status: ProjectStatus;
  readonly presentedAt: IsoDate;
  /** Data da última mudança de situação registrada com fonte. */
  readonly statusUpdatedAt?: IsoDate;
  readonly authorIds: readonly UUID[];
  readonly sources: readonly SourceRef[];
}

export type VotePosition = "sim" | "nao" | "abstencao" | "ausente" | "obstrucao";

export const VOTE_POSITION_LABELS: Record<VotePosition, string> = {
  sim: "Sim",
  nao: "Não",
  abstencao: "Abstenção",
  ausente: "Ausente",
  obstrucao: "Obstrução",
};

export interface VoteSession {
  readonly id: UUID;
  readonly institution: string;
  readonly description: string;
  readonly occurredAt: IsoDate;
  /** Projeto votado, quando a votação estiver vinculada a um. */
  readonly projectId?: UUID;
  readonly sources: readonly SourceRef[];
}

export interface VoteRecord {
  readonly id: UUID;
  readonly voteSessionId: UUID;
  readonly politicianId: UUID;
  readonly position: VotePosition;
  readonly sources: readonly SourceRef[];
}

/* -------------------------------------------------------------------------- */
/* Gastos públicos, verbas e emendas                                          */
/* -------------------------------------------------------------------------- */

export type ExpenseCategory =
  | "cota_parlamentar"
  | "gabinete"
  | "diarias"
  | "passagens"
  | "remuneracao"
  | "outra";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  cota_parlamentar: "Cota parlamentar",
  gabinete: "Despesa de gabinete",
  diarias: "Diárias",
  passagens: "Passagens",
  remuneracao: "Remuneração",
  outra: "Outra categoria",
};

export interface Expense {
  readonly id: UUID;
  readonly politicianId: UUID;
  readonly category: ExpenseCategory;
  /** Órgão pagador conforme a fonte (ex.: nome da casa legislativa). */
  readonly payingAgency: string;
  readonly description: string;
  readonly amount: BrlAmount;
  /** Mês de competência (primeiro dia do mês) informado pela fonte. */
  readonly referenceMonth: IsoDate;
  readonly source: SourceRef;
}

export type PublicFundKind = "emenda" | "convenio" | "contrato" | "transferencia";

export const PUBLIC_FUND_KIND_LABELS: Record<PublicFundKind, string> = {
  emenda: "Emenda parlamentar",
  convenio: "Convênio",
  contrato: "Contrato",
  transferencia: "Transferência de recursos",
};

export interface PublicFund {
  readonly id: UUID;
  readonly kind: PublicFundKind;
  readonly politicianId?: UUID;
  /** Órgão que destinou o recurso, conforme a fonte. */
  readonly grantingAgency: string;
  /** Entidade/órgão beneficiado, conforme a fonte. */
  readonly beneficiary: string;
  readonly purpose: string;
  readonly amount: BrlAmount;
  /** Valor efetivamente pago, quando a fonte informa. */
  readonly paidAmount?: BrlAmount;
  readonly referenceYear: number;
  readonly sources: readonly SourceRef[];
}

/* -------------------------------------------------------------------------- */
/* Notícias, declarações e linha do tempo                                     */
/* -------------------------------------------------------------------------- */

export interface NewsArticle {
  readonly id: UUID;
  readonly title: string;
  /** Veículo que publicou a matéria. */
  readonly publisher: string;
  readonly originalUrl: string;
  readonly publishedAt: IsoDateTime;
  /** Resumo descritivo, sem adjetivos e sem juízo de valor. */
  readonly summary: string;
  readonly category: string;
  readonly relatedPoliticianIds: readonly UUID[];
  /** Estado de revisão da notícia na plataforma. */
  readonly moderationStatus: ModerationStatus;
  /** Quando `true`, o conteúdo é fala atribuída ao político (declaração). */
  readonly isStatement: boolean;
  readonly source: SourceRef;
}

export type TimelineEventKind =
  | "eleicao"
  | "posse"
  | "projeto"
  | "votacao"
  | "nomeacao"
  | "decisao_judicial"
  | "outro";

export const TIMELINE_EVENT_KIND_LABELS: Record<TimelineEventKind, string> = {
  eleicao: "Eleição",
  posse: "Posse",
  projeto: "Projeto",
  votacao: "Votação",
  nomeacao: "Nomeação",
  decisao_judicial: "Decisão judicial",
  outro: "Outro evento",
};

export interface TimelineEvent {
  readonly id: UUID;
  readonly politicianId: UUID;
  readonly kind: TimelineEventKind;
  readonly title: string;
  readonly description: string;
  readonly occurredAt: IsoDate;
  readonly sources: readonly SourceRef[];
}

/* -------------------------------------------------------------------------- */
/* Conteúdo de usuário (nunca misturado a dados oficiais)                     */
/* -------------------------------------------------------------------------- */

export interface Comment {
  readonly id: UUID;
  readonly politicianId: UUID;
  readonly authorId: UUID;
  readonly authorDisplayName: string;
  readonly body: string;
  readonly moderationStatus: ModerationStatus;
  readonly createdAt: IsoDateTime;
}

export interface Rating {
  readonly id: UUID;
  readonly politicianId: UUID;
  readonly authorId: UUID;
  readonly authorDisplayName: string;
  /** Nota de 1 a 5 definida pelo usuário; é opinião, não dado oficial. */
  readonly score: 1 | 2 | 3 | 4 | 5;
  /** Justificativa opcional do próprio usuário. */
  readonly rationale?: string;
  readonly createdAt: IsoDateTime;
}

export interface Favorite {
  readonly id: UUID;
  readonly userId: UUID;
  readonly politicianId: UUID;
  readonly createdAt: IsoDateTime;
}

export interface UserList {
  readonly id: UUID;
  readonly ownerId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly isPublic: boolean;
  readonly createdAt: IsoDateTime;
}

export interface UserListItem {
  readonly id: UUID;
  readonly listId: UUID;
  readonly politicianId: UUID;
  readonly position: number;
}

export type ReportTargetType = "comment" | "rating" | "politician_data" | "news";

export interface Report {
  readonly id: UUID;
  readonly targetType: ReportTargetType;
  readonly targetId: UUID;
  readonly reporterId: UUID;
  readonly reason: string;
  /** Link da fonte que sustenta a denúncia ou a correção. */
  readonly sourceUrl?: string;
  readonly status: ModerationStatus;
  readonly createdAt: IsoDateTime;
}

export type CorrectionEntityType =
  | "politician"
  | "mandate"
  | "project"
  | "vote"
  | "expense"
  | "public_fund";

export interface CorrectionSuggestion {
  readonly id: UUID;
  readonly entityType: CorrectionEntityType;
  readonly entityId: UUID;
  readonly field: string;
  readonly currentValue?: string;
  readonly suggestedValue: string;
  /** Toda sugestão de correção exige link de fonte (R0.3). */
  readonly sourceUrl: string;
  readonly submittedBy?: UUID;
  readonly status: ModerationStatus;
  readonly createdAt: IsoDateTime;
}

/* -------------------------------------------------------------------------- */
/* Rankings                                                                   */
/* -------------------------------------------------------------------------- */

export type RankingMetric =
  | "projetos_apresentados"
  | "projetos_aprovados"
  | "participacao"
  | "gastos"
  | "emendas"
  | "atividade_legislativa";

export const RANKING_METRIC_LABELS: Record<RankingMetric, string> = {
  projetos_apresentados: "Projetos apresentados",
  projetos_aprovados: "Projetos aprovados",
  participacao: "Participação em votações",
  gastos: "Gastos públicos registrados",
  emendas: "Emendas e repasses",
  atividade_legislativa: "Atividade legislativa total",
};

/**
 * Direção do ordenamento. Explicitar a direção evita sugerir que "maior número"
 * significa automaticamente "melhor": a plataforma apenas ordena dados.
 */
export type RankingDirection = "desc" | "asc";

export interface RankingDefinition {
  readonly id: UUID;
  readonly metric: RankingMetric;
  readonly direction: RankingDirection;
  /** Recorte obrigatório de comparação (ex.: mesmo cargo e mesma esfera). */
  readonly officeScope?: PoliticalOffice;
  readonly stateScope?: StateCode;
  readonly periodStart: IsoDate;
  readonly periodEnd: IsoDate;
}

export interface RankingEntry {
  readonly politicianId: UUID;
  readonly position: number;
  /** Valor bruto da métrica, como publicado na origem. */
  readonly value: number;
}

export interface RankingSnapshot {
  readonly id: UUID;
  readonly definitionId: UUID;
  /** Metodologia textual publicada junto do resultado (R0.7). */
  readonly methodology: string;
  /** Identificadores das fontes usadas no cálculo. */
  readonly sourceIds: readonly string[];
  readonly computedAt: IsoDateTime;
  readonly entries: readonly RankingEntry[];
  /** Autor, quando for ranking criado por usuário. */
  readonly createdBy?: UUID;
  /** Rankings de usuário são sempre exibidos como OPINIÃO DO USUÁRIO. */
  readonly isUserRanking: boolean;
}

/* -------------------------------------------------------------------------- */
/* Auditoria                                                                  */
/* -------------------------------------------------------------------------- */

export type AuditAction = "insert" | "update" | "delete" | "moderate" | "login";

export interface AuditLogEntry {
  readonly id: UUID;
  readonly actorId?: UUID;
  readonly actorRole?: UserRole;
  readonly action: AuditAction;
  readonly entityType: string;
  readonly entityId?: UUID;
  /** Estado anterior e posterior, para permitir restauração (FASE 12). */
  readonly previousValue?: Record<string, unknown>;
  readonly newValue?: Record<string, unknown>;
  readonly reason?: string;
  readonly createdAt: IsoDateTime;
}
