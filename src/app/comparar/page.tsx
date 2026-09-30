import type { Metadata } from "next";
import { StageNotice } from "@/components/layout/stage-notice";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Comparar",
  description:
    "Comparação lado a lado de dados objetivos entre políticos, sem conclusão ou recomendação automática.",
};

const COMPARISON_FIELDS = [
  "Cargo",
  "Partido",
  "Mandatos",
  "Projetos apresentados",
  "Projetos aprovados",
  "Participação em votações",
  "Gastos e verbas",
  "Emendas e repasses",
  "Notícias relacionadas",
  "Fontes consultadas",
] as const;

export default function ComparePage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Ferramenta"
        title="Comparar políticos"
        description="A comparação coloca dados objetivos lado a lado, em colunas, incluindo o período e a fonte de cada número. A plataforma não calcula vencedor, nota final ou recomendação."
      />

      <StageNotice />

      <div className="mt-6">
        <EmptyState
          title="Não há políticos disponíveis para comparar"
          description="A seleção de políticos será habilitada quando existirem perfis cadastrados com dados e fontes verificadas."
          hint="Critério de comparação: cargos equivalentes e o mesmo período são comparados entre si. Comparar recortes diferentes sem aviso seria enganoso."
        />
      </div>

      <Section
        title="Campos comparados"
        description="Todos os campos vêm de dados registrados com fonte. Se um campo não existir para um dos políticos, a célula informará que o dado não foi coletado."
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COMPARISON_FIELDS.map((field) => (
            <li
              key={field}
              className="rounded border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800"
            >
              {field}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Regras da comparação">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card title="O que a ferramenta faz">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Exibe cada dado na mesma ordem para todos os políticos.</li>
              <li>Mostra o recorte de tempo usado em cada métrica.</li>
              <li>Liga cada número à fonte original consultada.</li>
              <li>Permite compartilhar o link da comparação.</li>
            </ul>
          </Card>
          <Card title="O que a ferramenta não faz">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Não atribui nota, estrela ou posição de &ldquo;melhor&rdquo;.</li>
              <li>Não resume o resultado em uma conclusão automática.</li>
              <li>Não mistura comentários e avaliações de usuários na tabela.</li>
              <li>Não usa estimativa quando o dado não foi coletado.</li>
            </ul>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
