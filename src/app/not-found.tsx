import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { mainNavigation } from "@/config/navigation";

export default function NotFound() {
  return (
    <Container width="narrow">
      <div className="py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Erro 404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-ink-600">
          O endereço acessado não existe na plataforma ou foi alterado.
        </p>

        <EmptyState
          className="mt-6"
          title="Voltar para uma área de consulta"
          description="Use um dos links abaixo para continuar navegando."
          action={
            <nav aria-label="Áreas disponíveis">
              <ul className="flex flex-wrap justify-center gap-3">
                <li>
                  <LinkButton href="/" variant="secondary">
                    Página inicial
                  </LinkButton>
                </li>
                {mainNavigation.map((item) => (
                  <li key={item.href}>
                    <LinkButton href={item.href} variant="secondary">
                      {item.label}
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </nav>
          }
        />
      </div>
    </Container>
  );
}
