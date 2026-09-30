import type { Metadata } from "next";
import { StageNotice } from "@/components/layout/stage-notice";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { RANKING_METRIC_LABELS, type RankingMetric } from "@/types/domain";

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "Rankings por critérios objetivos, com metodologia e origem dos dados visíveis, separados de rankings e avaliações de usuários.",
};

const METRICS = Object.keys(RANKING_METRIC_LABELS) as RankingMetric[];

export default function RankingsPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Ordenação de dados"
        title="Rankings"
        description="Aqui, ranking significa ordenar dados segundo um critério declarado. Não existe nota de qualidade, índice de aprovação ou 'melhor político' calculado pela plataforma."
      />

      <StageNotice />

      <div className="mt-6">
        <EmptyState
          title="Nenhum ranking calculado"
          description="Nenhum resultado é publicado antes de existirem dados coletados com fonte, porque um ranking sem origem verificável não é auditável."
          hint="Quando houver dados, cada ranking mostrará a fórmula, o período, o recorte de cargos e as fontes usadas no cálculo."
        />
      </div>

      <Section
        title="Critérios objetivos previstos"
        description="Cada critério gera um ranking separado. Os critérios não são combinados em um índice único, para evitar peso arbitrário."
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric) => (
            <li
              key={metric}
              className="rounded border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800"
            >
              {RANKING_METRIC_LABELS[metric]}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Metodologia obrigatória">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card title="Publicado junto de cada resultado">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Definição exata do que a métrica conta.</li>
              <li>Período considerado e data do cálculo.</li>
              <li>Recorte de comparação (mesmo cargo, mesma esfera, mesma casa).</li>
              <li>Fontes oficiais usadas e limitações conhecidas.</li>
            </ul>
          </Card>
          <Card title="O que nunca é feito">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Não há pontuação geral que resuma vários critérios.</li>
              <li>Não há ordenação por atributo pessoal ou posição política.</li>
              <li>Não há texto interpretativo concluindo quem é melhor.</li>
              <li>Não há uso de dado estimado ou não coletado.</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        title="Rankings e avaliações criados por usuários"
        description="Qualquer pessoa logada poderá montar seu próprio ranking ou avaliação. Esse conteúdo sempre aparece identificado como opinião."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">Dado objetivo da plataforma</Badge>
          <Badge tone="outline">Opinião do usuário · separado e identificado</Badge>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Ranking de usuário exibe autor, data e critério escolhido.</li>
          <li>Nunca é somado, misturado ou exibido como se fosse dado oficial.</li>
          <li>Passa por moderação e pode receber denúncia.</li>
        </ul>
      </Section>
    </Container>
  );
}
