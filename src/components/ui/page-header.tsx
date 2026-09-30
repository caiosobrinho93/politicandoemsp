import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Rótulo curto acima do título (ex.: seção da plataforma). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Ações ou metadados exibidos abaixo da descrição. */
  children?: ReactNode;
  className?: string;
}

/** Cabeçalho padrão de página: um único `h1` por página, com contexto. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("py-6 sm:py-8", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm text-ink-600 sm:text-base">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}
