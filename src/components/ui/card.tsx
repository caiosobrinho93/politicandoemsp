import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  /** Rodapé opcional, útil para links de fonte e ações. */
  footer?: ReactNode;
  className?: string;
  /** Elemento semântico do cartão. */
  as?: "div" | "article" | "section" | "li";
}

/** Superfície neutra padrão para agrupar informação. */
export function Card({
  children,
  title,
  description,
  footer,
  className,
  as: Element = "div",
}: CardProps) {
  return (
    <Element
      className={cn(
        "rounded-lg border border-ink-200 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {title || description ? (
        <header className="mb-2">
          {title ? (
            <h3 className="text-base font-semibold tracking-tight text-ink-900">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-ink-600">{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
      {footer ? (
        <footer className="mt-3 border-t border-ink-200 pt-3 text-sm">{footer}</footer>
      ) : null}
    </Element>
  );
}
