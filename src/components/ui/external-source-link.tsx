import { cn } from "@/lib/utils";

interface ExternalSourceLinkProps {
  /** URL exata da fonte consultada. */
  url: string;
  /** Nome do órgão/veículo que publicou a informação. */
  publisher: string;
  label?: string;
  /** Título do documento consultado (usado como `title` do link). */
  title?: string;
  /** Exibe o domínio de origem, reforçando a rastreabilidade. */
  showHost?: boolean;
  className?: string;
}

function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

/**
 * Link para a fonte original de uma informação.
 *
 * Sempre abre em nova aba com `rel="noopener noreferrer external"` e informa,
 * para leitores de tela, que o conteúdo é externo.
 */
export function ExternalSourceLink({
  url,
  publisher,
  label = "Ver fonte original",
  title,
  showHost = true,
  className,
}: ExternalSourceLinkProps) {
  const host = hostFromUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer external"
      title={title ? `${title} — ${publisher}` : `${publisher} — ${url}`}
      className={cn(
        "inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 hover:decoration-brand-600",
        className,
      )}
    >
      <span>{label}</span>
      <span className="font-normal text-ink-600">· {publisher}</span>
      {showHost && host ? (
        <span className="font-mono text-xs text-ink-400">{host}</span>
      ) : null}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-3 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M4 2h6v6" />
        <path d="M10 2 3 9" />
      </svg>
      <span className="sr-only">(abre em nova aba, conteúdo externo)</span>
    </a>
  );
}
