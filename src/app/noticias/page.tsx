import type { Metadata } from "next";
import { EvidenceLegend } from "@/components/evidence/evidence-legend";
import { StageNotice } from "@/components/layout/stage-notice";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Notícias relacionadas a políticos, sempre com título, veículo, data, resumo e link original, identificadas como relato de imprensa.",
};

const REQUIRED_FIELDS = [
  "Título da matéria",
  "Veículo que publicou",
  "Data de publicação",
  "Link original",
  "Resumo descritivo, sem adjetivos",
  "Político relacionado",
  "Categoria",
] as const;

export default function NewsPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Imprensa"
        title="Notícias"
        description="Seção de notícias por político. Cada matéria é exibida como relato de terceiro, com o link original, e nunca é tratada como prova de um fato nem misturada com dados oficiais."
      />

      <StageNotice />

      <div className="mt-6">
        <EmptyState
          title="Nenhuma notícia publicada"
          description="A coleta de notícias começa depois que os perfis de políticos existirem, para que cada matéria seja vinculada a uma pessoa já cadastrada com dados verificados."
          hint="A plataforma não gera texto jornalístico próprio: ela apenas registra título, veículo, data, resumo e link do conteúdo publicado na origem."
        />
      </div>

      <Section
        title="Informação obrigatória em cada notícia"
        description="Sem esses campos a matéria não é publicada, e matérias repetidas são agrupadas para evitar duplicidade."
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {REQUIRED_FIELDS.map((field) => (
            <li
              key={field}
              className="rounded border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800"
            >
              {field}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Notícia não é prova de fato"
        description="A origem de cada conteúdo muda o modo como ele deve ser lido. Estes três selos são os que aparecem nesta seção."
      >
        <EvidenceLegend kinds={["noticia", "declaracao", "opiniao"]} />
      </Section>

      <Section title="Padrões editoriais">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card title="Como as matérias são tratadas">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>O título original não é reescrito com opinião da plataforma.</li>
              <li>Alegações são apresentadas como alegações, atribuídas a quem as fez.</li>
              <li>Falas do político aparecem identificadas como declaração.</li>
              <li>Nenhuma matéria isolada é apresentada como conclusão.</li>
            </ul>
          </Card>
          <Card title="Revisão antes de publicar">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Toda matéria passa por revisão humana antes de aparecer aqui.</li>
              <li>O link original é conferido antes da publicação.</li>
              <li>Matérias repetidas do mesmo assunto são agrupadas.</li>
            </ul>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
