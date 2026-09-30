import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NavLinks } from "@/components/layout/nav-links";
import { siteConfig } from "@/config/site";

/**
 * Cabeçalho institucional.
 *
 * Estrutura: faixa de contexto (fontes e metodologia), identificação da
 * plataforma e navegação principal.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-white">
      <div className="border-b border-ink-200 bg-ink-100">
        <Container className="flex min-h-9 items-center justify-between gap-3 py-1 text-xs text-ink-600">
          <p className="truncate">
            Dados oficiais, notícias, declarações e opiniões são exibidos em
            blocos separados e identificados.
          </p>
          <Link href="/sobre" className="shrink-0 font-medium no-underline">
            Metodologia
          </Link>
        </Container>
      </div>

      <Container>
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
          <Link
            href="/"
            className="flex items-baseline gap-2 no-underline"
            aria-label={`${siteConfig.name} — página inicial`}
          >
            <span className="text-lg font-bold tracking-tight text-ink-900">
              {siteConfig.name}
            </span>
            <span className="text-xs font-medium text-ink-500">
              informações públicas · {siteConfig.scope.stateCode}
            </span>
          </Link>
          <p className="hidden max-w-md text-xs text-ink-500 lg:block">
            O objetivo é informar e permitir comparação — não convencer.
          </p>
        </div>
      </Container>

      <nav aria-label="Navegação principal" className="border-t border-ink-200">
        <Container>
          <NavLinks />
        </Container>
      </nav>
    </header>
  );
}
