import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "outline";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-ink-200 bg-ink-100 text-ink-700",
  brand: "border-brand-200 bg-brand-50 text-brand-800",
  outline: "border-ink-300 bg-transparent text-ink-700",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  /** Explicação acessível, quando o texto curto não é suficiente. */
  title?: string;
}

/** Etiqueta curta e neutra para metadados (tipo, categoria, esfera). */
export function Badge({ children, tone = "neutral", className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
