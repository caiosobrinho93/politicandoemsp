import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Explica exatamente o que está ausente. */
  title: string;
  description?: string;
  /** Como o dado será obtido/publicado (transparência sobre o processo). */
  hint?: string;
  /** Ação opcional (link para fonte ou página relacionada). */
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vazio honesto.
 *
 * Regra R0.9: quando não há dado coletado com fonte, a interface informa a
 * ausência. Nunca exibimos valor estimado, exemplo fictício ou número de
 * preenchimento.
 */
export function EmptyState({
  title,
  description,
  hint,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-ink-300 bg-white p-5 text-center sm:p-8",
        className,
      )}
    >
      <p className="text-base font-semibold text-ink-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-2xl text-sm text-ink-600">{description}</p>
      ) : null}
      {hint ? (
        <p className="mx-auto mt-3 max-w-2xl rounded border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-600">
          {hint}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
