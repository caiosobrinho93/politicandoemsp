import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-ink-200 bg-ink-100 text-ink-700",
  info: "border-brand-200 bg-brand-50 text-brand-800",
  success: "border-tag-fato/35 bg-tag-fato-soft text-tag-fato",
  warning: "border-tag-noticia/35 bg-tag-noticia-soft text-tag-noticia",
  danger: "border-tag-opiniao/35 bg-tag-opiniao-soft text-tag-opiniao",
};

interface StatusTagProps {
  children: ReactNode;
  /**
   * Significado do estado. As cores são semânticas (estado do registro), nunca
   * relacionadas a partido ou posição política.
   */
  tone?: StatusTone;
  className?: string;
  title?: string;
}

/** Etiqueta de estado (situação de cadastro, moderação, tramitação). */
export function StatusTag({
  children,
  tone = "neutral",
  className,
  title,
}: StatusTagProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
