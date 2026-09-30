import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DisclosureProps {
  /** Texto do resumo clicável (ex.: "Como este dado foi obtido"). */
  title: string;
  children: ReactNode;
  /** Texto curto exibido ao lado do título. */
  hint?: string;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Bloco expansível nativo (`<details>`/`<summary>`), sem JavaScript.
 *
 * Usado para metodologia, origem de dados e textos longos que não devem
 * competir com o dado principal na tela do celular.
 */
export function Disclosure({
  title,
  children,
  hint,
  defaultOpen = false,
  className,
}: DisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className={cn("rounded-lg border border-ink-200 bg-white", className)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink-800 marker:hidden">
        <span>
          {title}
          {hint ? (
            <span className="ml-2 font-normal text-ink-500">{hint}</span>
          ) : null}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="size-3 shrink-0 text-ink-500 transition-transform duration-150"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </summary>
      <div className="border-t border-ink-200 px-4 py-3 text-sm text-ink-700">
        {children}
      </div>
    </details>
  );
}
