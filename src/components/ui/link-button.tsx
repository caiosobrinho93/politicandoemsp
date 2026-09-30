import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tipo do `href` derivado do próprio `Link` do Next, para continuar correto
 * caso as rotas tipadas estejam habilitadas.
 */
type LinkHref = ComponentProps<typeof Link>["href"];

type LinkButtonVariant = "primary" | "secondary";

const VARIANTS: Record<LinkButtonVariant, string> = {
  primary: "border border-brand-700 bg-brand-700 text-white hover:bg-brand-800",
  secondary: "border border-ink-300 bg-white text-ink-800 hover:bg-ink-100",
};

interface LinkButtonProps {
  href: LinkHref;
  children: ReactNode;
  variant?: LinkButtonVariant;
  className?: string;
}

/** Link com aparência de botão (alvo de toque de 44px, foco visível). */
export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded px-4 text-sm font-semibold no-underline",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
