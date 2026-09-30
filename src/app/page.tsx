import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceLegend } from "@/components/evidence/evidence-legend";
import { StageNotice } from "@/components/layout/stage-notice";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ExternalSourceLink } from "@/components/ui/external-source-link";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { officialSources } from "@/config/sources";

export const metadata: Metadata = {
  title: "Conheça os fatos. Consulte as fontes. Tire suas próprias conclusões.",
  description: siteConfig.description,
};

/** Áreas de consulta previstas. Descrevem o que a plataforma reúne, sem dados. */
const consultationAreas = [
  {
    title: "Projetos e atuação",
    description:
      "Proposições apresentadas e sua situação de tramitação, presença e participação em votações, sempre com o registro da casa legislativa de origem.",
  },
  {
    title: "Votações e posicionamentos",
    description:
      "Como cada político votou em cada votação registrada e o que foi declarado publicamente pelo próprio político.",
  },
  {
    title: "Salários, verbas e despesas",
    description:
      "Remuneração, cota de atividade parlamentar e despesas de gabinete conforme publicadas pelos portais de transparência.",
  },
  {
    title: "Emendas, contratos e repasses",
    description:
      "Emendas parlamentares, convênios, contratos e transferências de recursos com órgão, beneficiário e valores informados na origem.",
  },
  {
    title: "Notícias relacionadas",
    description:
      "Matérias recentes sobre cada político, exibidas como relato de imprensa com título, veículo, data, resumo e link original.",
  },
  {
    title: "Fontes e linha do tempo",
    description:
      "Cada informação exibida aponta a fonte consultada e a data de coleta, além dos marcos registrados na trajetória pública do político.",
  },
] as const;

export default function HomePage() {
  return (
    <Container>
      <Section isFirst>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Consulta pública · {siteConfig.scope.state} ({siteConfig.scope.stateCode})
        </p>
        <h1 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          {siteConfig.tagline}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink-700 sm:text-base">
          A plataforma organiza informações públicas e verificáveis sobre
          políticos, autoridades e candidatos: projetos, votações, gastos,
          emendas, notícias e fontes originais. O objetivo é informar e permitir
          comparação — nunca dizer em quem votar.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton href="/politicos">Consultar políticos</LinkButton>
          <LinkButton href="/sobre" variant="secondary">
            Como a plataforma funciona
          </LinkButton>
        </div>
        <StageNotice className="mt-6" />
      </Section>

      <Section
        title="Como ler as informações"
        description="Todo conteúdo é identificado pela sua origem. Os selos não julgam o conteúdo: eles dizem de onde a informação veio e qual é o limite de uso dela."
      >
        <EvidenceLegend />
      </Section>

      <Section
        title="O que a plataforma reúne"
        description="As áreas abaixo indicam o que pode ser consultado por político. Elas ficam vazias enquanto o dado não for registrado com fonte oficial."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {consultationAreas.map((area) => (
            <Card as="li" key={area.title} title={area.title}>
              <p className="text-sm text-ink-700">{area.description}</p>
            </Card>
          ))}
        </ul>
      </Section>

      <Section
        title="Rankings objetivos e opiniões de usuários"
        description="Ranking aqui é ordenação de dados, com metodologia e origem explícitas. Não existe nota de 'melhor político' calculada pela plataforma."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Card
            title="Rankings por critério objetivo"
            description="Ordenação transparente e reproduzível, sempre dentro do mesmo recorte (mesmo cargo e mesmo período)."
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Critérios publicados, como projetos apresentados ou aprovados.</li>
              <li>Fórmula, período e fontes exibidos junto do resultado.</li>
              <li>Recálculo possível a partir dos dados registrados.</li>
            </ul>
          </Card>
          <Card
            title="Rankings e avaliações de usuários"
            description="Conteúdo criado por pessoas logadas aparece em bloco separado e identificado como opinião."
          >
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Nunca se misturam com dados oficiais na mesma tabela.</li>
              <li>Identificam autor e data.</li>
              <li>Passam por moderação e podem ser reportados.</li>
            </ul>
          </Card>
        </div>
        <p className="mt-4 text-sm text-ink-600">
          <Link href="/rankings" className="no-underline">
            Ver a página de rankings e metodologia
          </Link>
        </p>
      </Section>

      <Section
        title="Fontes oficiais consultadas"
        description="Estas são as fontes públicas usadas como origem das informações. Cada dado registrado guarda a URL exata da página consultada e a data da coleta."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {officialSources.map((source) => (
            <Card as="li" key={source.id} title={source.name}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{source.acronym}</Badge>
                <Badge>{source.scope}</Badge>
                <Badge>{source.kind}</Badge>
                {source.state ? <Badge>UF {source.state}</Badge> : <Badge>Nacional</Badge>}
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
                {source.provides.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {source.note ? (
                <p className="mt-3 text-xs text-ink-600">{source.note}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                <ExternalSourceLink
                  url={source.url}
                  publisher={source.acronym}
                  label="Página oficial"
                />
                {source.dataUrl ? (
                  <ExternalSourceLink
                    url={source.dataUrl}
                    publisher={source.acronym}
                    label="Dados abertos"
                  />
                ) : null}
              </div>
            </Card>
          ))}
        </ul>
      </Section>
    </Container>
  );
}
