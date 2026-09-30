import {
  EVIDENCE_DEFINITIONS,
  MISSING_DATA_LABEL,
  MISSING_DATA_NOTE,
  type EvidenceKind,
} from "@/lib/evidence";
import { cn } from "@/lib/utils";

interface EvidenceBadgeProps {
  /** Categoria de origem da informação que está sendo exibida ao lado. */
  kind: EvidenceKind;
  className?: string;
}

/**
 * Selo que identifica a ORIGEM da informação ao lado da qual aparece.
 *
 * O selo não avalia o conteúdo: apenas informa se o item é fato, dado oficial,
 * notícia, declaração do político ou opinião/análise.
 */
export function EvidenceBadge({ kind, className }: EvidenceBadgeProps) {
  const definition = EVIDENCE_DEFINITIONS[kind];

  return (
    <span
      title={`${definition.label} — ${definition.definition} Regra de uso: ${definition.rule}`}
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide",
        definition.tone,
        className,
      )}
    >
      {definition.label}
    </span>
  );
}

interface MissingDataProps {
  /** Explicação adicional específica do contexto, quando necessário. */
  detail?: string;
  className?: string;
}

/**
 * Marcador de dado ausente.
 *
 * Regra R0.9: usamos sempre o mesmo rótulo para deixar claro que a informação
 * não foi coletada — em vez de exibir valor vazio, "0" ou estimativa.
 */
export function MissingData({ detail, className }: MissingDataProps) {
  return (
    <span
      title={detail ?? MISSING_DATA_NOTE}
      className={cn(
        "inline-flex items-center gap-1 rounded border border-dashed border-tag-ausente/40 bg-tag-ausente-soft px-2 py-0.5 text-xs font-medium text-tag-ausente",
        className,
      )}
    >
      {MISSING_DATA_LABEL}
    </span>
  );
}
