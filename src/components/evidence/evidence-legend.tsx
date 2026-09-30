import {
  EVIDENCE_DEFINITIONS,
  EVIDENCE_ORDER,
  type EvidenceKind,
} from "@/lib/evidence";
import { cn } from "@/lib/utils";

interface EvidenceLegendProps {
  /** Subconjunto de categorias, quando a página trata de apenas algumas. */
  kinds?: readonly EvidenceKind[];
  /** Texto introdutório opcional. */
  intro?: string;
  className?: string;
  /** `grid` para 2 colunas no desktop, `stack` para lista simples. */
  layout?: "grid" | "stack";
}

/**
 * Explicação das categorias de informação usadas na plataforma.
 *
 * É o texto de referência que o usuário encontra na home e na página "Sobre":
 * define o que cada selo significa e qual a regra de uso.
 */
export function EvidenceLegend({
  kinds = EVIDENCE_ORDER,
  intro,
  className,
  layout = "grid",
}: EvidenceLegendProps) {
  return (
    <div className={className}>
      {intro ? <p className="mb-4 max-w-3xl text-sm text-ink-600">{intro}</p> : null}
      <ul
        className={cn(
          "grid gap-3",
          layout === "grid" ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {kinds.map((kind) => {
          const definition = EVIDENCE_DEFINITIONS[kind];
          return (
            <li
              key={kind}
              className="rounded-lg border border-ink-200 bg-white p-4 shadow-sm"
            >
              <span
                className={cn(
                  "inline-flex items-center rounded border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide",
                  definition.tone,
                )}
              >
                {definition.label}
              </span>
              <p className="mt-2 text-sm text-ink-800">{definition.definition}</p>
              <p className="mt-2 text-xs text-ink-600">
                <span className="font-semibold text-ink-700">Regra de uso: </span>
                {definition.rule}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
