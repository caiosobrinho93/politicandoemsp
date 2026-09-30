/**
 * Selos epistêmicos do projeto.
 *
 * Todo conteúdo apresentado na plataforma precisa deixar explícito QUAL É A
 * ORIGEM da informação. Este arquivo é a única fonte de verdade desses rótulos:
 * se um selo novo for necessário, ele é adicionado aqui.
 *
 * Os selos NÃO fazem julgamento sobre o conteúdo — apenas identificam de onde
 * o dado veio e qual o seu limite de uso.
 */

export type EvidenceKind =
  | "fato"
  | "dado_oficial"
  | "noticia"
  | "declaracao"
  | "opiniao";

export interface EvidenceDefinition {
  /** Rótulo exibido na interface (sempre em português, maiúsculas). */
  readonly label: string;
  /** O que esta categoria significa, em uma frase. */
  readonly definition: string;
  /** Regra de uso obrigatória na plataforma. */
  readonly rule: string;
  /** Classes utilitárias do selo (par cor de texto + fundo suave + borda). */
  readonly tone: string;
}

export const EVIDENCE_DEFINITIONS: Record<EvidenceKind, EvidenceDefinition> = {
  fato: {
    label: "FATO",
    definition:
      "Acontecimento ou situação objetiva registrada em documento público identificável.",
    rule: "Só é exibido quando existe fonte primária declarada e data de referência.",
    tone: "border-tag-fato/35 bg-tag-fato-soft text-tag-fato",
  },
  dado_oficial: {
    label: "DADO OFICIAL",
    definition:
      "Número ou registro produzido por órgão público em sistema oficial de origem.",
    rule:
      "Sempre exibido com o órgão responsável, a URL da fonte e a data de coleta.",
    tone: "border-tag-dado-oficial/35 bg-tag-dado-oficial-soft text-tag-dado-oficial",
  },
  noticia: {
    label: "NOTÍCIA",
    definition: "Relato publicado por veículo de imprensa a respeito do político.",
    rule:
      "É relato de terceiro: nunca é tratado como prova de fato nem exibido como dado oficial.",
    tone: "border-tag-noticia/35 bg-tag-noticia-soft text-tag-noticia",
  },
  declaracao: {
    label: "DECLARAÇÃO DO POLÍTICO",
    definition:
      "Fala, nota ou posicionamento atribuído ao próprio político ou ao seu gabinete.",
    rule:
      "Registrado como manifestação do político, sem juízo da plataforma sobre o conteúdo.",
    tone: "border-tag-declaracao/35 bg-tag-declaracao-soft text-tag-declaracao",
  },
  opiniao: {
    label: "OPINIÃO/ANÁLISE",
    definition:
      "Avaliação, comentário, ranking próprio ou análise produzida por terceiro ou usuário.",
    rule:
      "Fica sempre separada dos dados oficiais e identificada com o autor quando houver.",
    tone: "border-tag-opiniao/35 bg-tag-opiniao-soft text-tag-opiniao",
  },
};

/** Ordem canônica de exibição (usada na home e em páginas explicativas). */
export const EVIDENCE_ORDER: readonly EvidenceKind[] = [
  "fato",
  "dado_oficial",
  "noticia",
  "declaracao",
  "opiniao",
];

/** Texto padrão para informação que não existe no sistema ou não foi coletada. */
export const MISSING_DATA_LABEL = "Não coletado";

/**
 * Explicação padrão de célula/dado ausente.
 * Regra R0.9: nunca preencher com valor estimado ou fictício.
 */
export const MISSING_DATA_NOTE =
  "Este dado não foi coletado com fonte verificada. A plataforma não estima nem preenche valores.";
