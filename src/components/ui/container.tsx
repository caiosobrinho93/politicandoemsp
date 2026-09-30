import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Largura máxima: `default` para conteúdo geral, `narrow` para textos longos. */
  width?: "default" | "narrow";
}

/**
 * Limita a largura do conteúdo e mantém margens consistentes.
 * Mobile-first: o padding aumenta a partir de `sm` e `lg`.
 */
export function Container({ children, className, width = "default" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        width === "narrow" ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
