import Link from "next/link";
import { Container } from "@/components/ui/container";
import { mainNavigation } from "@/config/navigation";
import { institutionalNotices, siteConfig } from "@/config/site";
import { officialSources } from "@/config/sources";

/**
 * Rodapé institucional.
 *
 * Reúne os avisos de imparcialidade, a política de fontes e a lista de fontes
 * oficiais previstas — informação necessária para o usuário auditar o projeto.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-ink-200 bg-white">
      <Container className="py-8">
        <section
          aria-labelledby="aviso-imparcialidade"
          className="rounded-lg border border-ink-200 bg-ink-50 p-4 sm:p-5"
        >
          <h2
            id="aviso-imparcialidade"
            className="text-sm font-semibold text-ink-900"
          >
            Aviso de imparcialidade
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            <li>{institutionalNotices.impartiality}</li>
            <li>{institutionalNotices.political_neutrality}</li>
            <li>{institutionalNotices.sources}</li>
            <li>{institutionalNotices.evidenceSeparation}</li>
            <li>{institutionalNotices.corrections}</li>
          </ul>
        </section>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <nav aria-labelledby="rodape-navegacao">
            <h2
              id="rodape-navegacao"
              className="text-sm font-semibold text-ink-900"
            >
              Navegação
            </h2>
            <ul className="mt-2 space-y-1 text-sm">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="no-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="rodape-fontes">
            <h2 id="rodape-fontes" className="text-sm font-semibold text-ink-900">
              Fontes oficiais previstas
            </h2>
            <ul className="mt-2 space-y-1 text-sm">
              {officialSources.map((source) => (
                <li key={source.id}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="no-underline"
                  >
                    {source.acronym}
                  </a>
                  <span className="ml-1 text-xs text-ink-500">
                    (abre em nova aba)
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="rodape-projeto">
            <h2 id="rodape-projeto" className="text-sm font-semibold text-ink-900">
              Transparência do projeto
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              Cada informação exibida na plataforma indica a fonte de origem e a
              data de coleta. Quando um dado ainda não foi coletado, a interface
              informa a ausência em vez de estimar um valor.
            </p>
            <p className="mt-2 text-sm text-ink-600">
              <Link href="/sobre" className="no-underline">
                Ver metodologia, fontes e limitações
              </Link>
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-ink-200 pt-4 text-xs text-ink-500">
          <p>
            {year} · {siteConfig.name} · Escopo inicial: {siteConfig.scope.state} (
            {siteConfig.scope.stateCode}). {siteConfig.scope.expansionNote}
          </p>
        </div>
      </Container>
    </footer>
  );
}
