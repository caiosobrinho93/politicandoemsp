import type { Metadata } from "next";
import { EvidenceLegend } from "@/components/evidence/evidence-legend";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ExternalSourceLink } from "@/components/ui/external-source-link";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { officialSources } from "@/config/sources";

export const metadata: Metadata = {
  title: "Sobre a plataforma",
  description:
    "Metodologia, fontes oficiais, regras de separação entre dado oficial, notícia, declaração e opinião, e limitações da plataforma.",
};

export default function AboutPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Transparência"
        title="Sobre a plataforma"
        description={`${siteConfig.name} é uma base de consulta sobre informações públicas de políticos, autoridades e candidatos, com escopo inicial em ${siteConfig.scope.state}. O objetivo é informar e permitir comparação — não convencer ninguém a votar em quem quer que seja.`}
      />

      <Section
        isFirst
        title="Compromissos do projeto"
        description="Estas regras valem para todo o conteúdo exibido e não podem ser flexibilizadas por conveniência editorial."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          <Card as="li" title="Nada de dado inventado">
            <p className="text-sm text-ink-700">
              Nenhum nome, número, data, valor ou cargo é estimado, completado ou
              ilustrado. Quando o dado não existe, a plataforma informa que não
              foi coletado.
            </p>
          </Card>
          <Card as="li" title="Fonte para todo dado factual">
            <p className="text-sm text-ink-700">
              Cada informação factual registrada guarda órgão de origem, URL
              exata da consulta e data da coleta.
            </p>
          </Card>
          <Card as="li" title="Separação de origem da informação">
            <p className="text-sm text-ink-700">
              Dado oficial, notícia, declaração e opinião nunca aparecem
              misturados: cada bloco é identificado pelo selo correspondente.
            </p>
          </Card>
          <Card as="li" title="Sem recomendação de voto">
            <p className="text-sm text-ink-700">
              A plataforma não produz nota, ranking único nem conclusão sobre
              quem é melhor. Ranking só existe por critério objetivo declarado.
            </p>
          </Card>
        </ul>
      </Section>

      <Section
        title="Como ler as informações"
        description="São cinco categorias. O selo diz de onde a informação veio e como ela pode ser usada."
      >
        <EvidenceLegend />
      </Section>

      <Section
        title="Fontes oficiais"
        description="Órgãos públicos usados como origem das informações. A plataforma não publica conteúdo próprio de caráter opinativo sobre pessoas."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <caption className="sr-only">
              Fontes oficiais previstas, com esfera, tipo de informação pública e
              link de acesso
            </caption>
            <thead>
              <tr className="border-b border-ink-300 text-left text-xs uppercase tracking-wide text-ink-600">
                <th scope="col" className="py-2 pr-3">
                  Órgão
                </th>
                <th scope="col" className="py-2 pr-3">
                  Esfera
                </th>
                <th scope="col" className="py-2 pr-3">
                  Tipo de informação
                </th>
                <th scope="col" className="py-2">
                  Acesso
                </th>
              </tr>
            </thead>
            <tbody>
              {officialSources.map((source) => (
                <tr key={source.id} className="border-b border-ink-200 align-top">
                  <th scope="row" className="py-3 pr-3 text-left font-semibold text-ink-900">
                    {source.acronym}
                    <span className="block font-normal text-xs text-ink-600">
                      {source.name}
                    </span>
                  </th>
                  <td className="py-3 pr-3">
                    <Badge>
                      {source.scope}
                      {source.state ? ` · ${source.state}` : ""}
                    </Badge>
                  </td>
                  <td className="py-3 pr-3 text-ink-700">
                    <ul className="list-disc space-y-0.5 pl-4">
                      {source.provides.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3">
                    <ExternalSourceLink
                      url={source.url}
                      publisher={source.acronym}
                      label="Página oficial"
                      showHost={false}
                    />
                    {source.dataUrl ? (
                      <ExternalSourceLink
                        url={source.dataUrl}
                        publisher={source.acronym}
                        label="Dados abertos"
                        showHost={false}
                        className="mt-1"
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Estado do projeto"
        description="O desenvolvimento é feito em fases registradas em um arquivo de requisitos no repositório, executadas uma por vez. Abaixo, o que já está pronto e o que ainda não está."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Card title="Concluído">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Estrutura inicial da aplicação e layout institucional.</li>
              <li>Padrão de selos de origem da informação.</li>
              <li>Catálogo de fontes oficiais consultadas.</li>
              <li>Áreas de consulta publicadas com estado vazio explícito.</li>
            </ul>
          </Card>
          <Card title="Ainda não implementado">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
              <li>Coleta e publicação de dados reais com fonte.</li>
              <li>Contas de usuário, favoritos, comentários e correções.</li>
              <li>Cálculo de rankings e ferramenta de comparação ativa.</li>
              <li>Painel administrativo e histórico de alterações.</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="Limitações que você deve considerar">
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>
            A ausência de um dado na plataforma significa apenas que ele não foi
            coletado — não significa que o dado não exista na fonte oficial.
          </li>
          <li>
            Fontes oficiais podem ter erros, atrasos ou correções posteriores. A
            plataforma registra o que a fonte publicava na data da coleta.
          </li>
          <li>
            Notícias são relatos de terceiros: mesmo com link verificado, não são
            prova de um fato.
          </li>
          <li>
            Métricas de atividade legislativa não medem mérito, impacto social ou
            qualidade de um mandato.
          </li>
          <li>
            A comparação entre cargos diferentes exige cautela, porque as
            competências e os volumes de trabalho são distintos.
          </li>
        </ul>
      </Section>

      <Section
        title="Como apontar um erro"
        description="Corrigir informação é parte central do projeto: toda sugestão aceita fica registrada no histórico do dado."
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>
            A sugestão de correção exigirá a indicação do campo e o link da fonte
            que sustenta a mudança.
          </li>
          <li>
            A alteração só é aplicada após revisão humana e passa a constar no
            histórico público do registro.
          </li>
          <li>
            O canal de sugestão será disponibilizado junto com a área do usuário.
            Até então, as correções são feitas diretamente pela administração do
            projeto.
          </li>
        </ul>
      </Section>

      <Section title="Escopo e expansão">
        <p className="max-w-3xl text-sm text-ink-700">
          O projeto começa por {siteConfig.scope.state} e é estruturado por cargo
          e esfera federativa, de modo que a expansão para outros estados e para
          o nível federal reaproveite o mesmo modelo de dados e as mesmas regras
          de fonte. A comparação, o ranking e a linha do tempo seguem os mesmos
          critérios em qualquer estado.
        </p>
      </Section>
    </Container>
  );
}

