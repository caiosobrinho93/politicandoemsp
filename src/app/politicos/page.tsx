import type { Metadata } from "next";
import { StageNotice } from "@/components/layout/stage-notice";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import {
  POLITICAL_OFFICE_LABELS,
  POLITICAL_OFFICE_LEVEL,
  type PoliticalOffice,
} from "@/types/domain";

export const metadata: Metadata = {
  title: "Políticos",
  description: `Consulta a políticos de ${siteConfig.scope.state}: mandatos, projetos, votações, gastos, notícias e fontes.`,
};

const OFFICES = Object.keys(POLITICAL_OFFICE_LABELS) as PoliticalOffice[];

export default function PoliticiansPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Consulta"
        title="Políticos"
        description={`Perfis de políticos e autoridades com mandatos, projetos, votações, gastos, emendas, notícias, linha do tempo e fontes. Escopo inicial: ${siteConfig.scope.state}, com estrutura já preparada para outros estados.`}
      />

      <StageNotice />

      <div className="mt-6">
        <EmptyState
          title="Nenhum político cadastrado nesta base"
          description="A busca e os filtros de políticos entram no ar junto com o primeiro lote de dados coletados e conferidos contra a fonte oficial."
          hint="Não exibimos perfil de exemplo, nome ilustrativo ou dado incompleto. Quando o cadastro começar, cada campo exibido terá a fonte apontada."
        />
      </div>

      <Section
        title="Cargos previstos"
        description="A plataforma é organizada por cargo e esfera, para que a comparação aconteça sempre entre cargos equivalentes."
      >
        <ul className="flex flex-wrap gap-2">
          {OFFICES.map((office) => (
            <li key={office}>
              <Badge tone="outline">
                {POLITICAL_OFFICE_LABELS[office]} · {POLITICAL_OFFICE_LEVEL[office]}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="O que cada perfil vai mostrar"
        description="Somente informação pública, com o registro de onde veio."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card as="li" title="Identificação">
            <p className="text-sm text-ink-700">
              Foto publicada em fonte oficial, nome conforme registro eleitoral,
              cargo atual comprovado e partido conforme a fonte.
            </p>
          </Card>
          <Card as="li" title="Mandatos">
            <p className="text-sm text-ink-700">
              Períodos de mandato, órgão e esfera. Mandato em curso é exibido
              como em curso, nunca com data final estimada.
            </p>
          </Card>
          <Card as="li" title="Projetos e votações">
            <p className="text-sm text-ink-700">
              Proposições apresentadas, situação de tramitação e como votou em
              cada votação com registro nominal.
            </p>
          </Card>
          <Card as="li" title="Gastos, verbas e emendas">
            <p className="text-sm text-ink-700">
              Despesas, remuneração, emendas e repasses com órgão pagador,
              período e valor conforme a origem.
            </p>
          </Card>
          <Card as="li" title="Notícias e declarações">
            <p className="text-sm text-ink-700">
              Matérias relacionadas com link original, separadas das falas
              atribuídas ao próprio político.
            </p>
          </Card>
          <Card as="li" title="Fontes e histórico">
            <p className="text-sm text-ink-700">
              Lista de fontes consultadas por perfil e histórico de alterações
              de cada informação.
            </p>
          </Card>
        </ul>
      </Section>
    </Container>
  );
}
