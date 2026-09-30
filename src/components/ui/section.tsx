import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  /** Título da seção (renderizado como `h2` por padrão). */
  title?: string;
  description?: string;
  /** Identificador para links internos e navegação por âncora. */
  id?: string;
  className?: string;
  /** Remove a separação superior quando a seção é a primeira da página. */
  isFirst?: boolean;
}

/** Bloco de conteúdo com título acessível e espaçamento vertical padronizado. */
export function Section({
  children,
  title,
  description,
  id,
  className,
  isFirst = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "border-t border-ink-200 py-8 sm:py-10",
        isFirst && "border-t-0 pt-6 sm:pt-8",
        className,
      )}
    >
      {title || description ? (
        <header className="mb-4 sm:mb-6">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight text-ink-900 sm:text-xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 max-w-3xl text-sm text-ink-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
