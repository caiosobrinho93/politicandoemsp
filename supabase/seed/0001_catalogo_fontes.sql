-- =============================================================================
-- SEED 0001 — Catálogo de fontes oficiais (tarefa 2.17)
--
-- O que este seed insere: SOMENTE o catálogo institucional de fontes, copiado de
-- `src/config/sources.ts` (nome do órgão + página institucional + portal de dados
-- abertos, quando existe).
--
-- O que este seed NÃO insere (e por quê):
--   · partidos — sigla, nome e número de registro são dados factuais que só
--     entram com a fonte do TSE na FASE 04 (R0.1/R0.3). Não há lista "de memória".
--   · políticos, mandatos, projetos, gastos — mesma regra.
--   · cargos/esferas — não são linhas de tabela: são os ENUMs criados na migração
--     0001 (`political_office`, `federative_level`), espelhados em
--     `src/types/domain.ts` com seus rótulos em português.
--
-- `verified = true` aqui significa: "estas são as páginas institucionais oficiais
-- dos órgãos catalogados". Não é afirmação sobre nenhum dado político.
-- O seed é idempotente: reexecutar não duplica linhas.
-- =============================================================================

with catalogo (official_source_id, publisher, url, data_url) as (
  values
    ('tse', 'Tribunal Superior Eleitoral', 'https://www.tse.jus.br', 'https://dadosabertos.tse.jus.br'),
    ('tre-sp', 'Tribunal Regional Eleitoral de São Paulo', 'https://www.tre-sp.jus.br', null),
    ('camara-deputados', 'Câmara dos Deputados', 'https://www.camara.leg.br', 'https://dadosabertos.camara.leg.br'),
    ('senado-federal', 'Senado Federal', 'https://www12.senado.leg.br', 'https://legis.senado.leg.br/dadosabertos'),
    ('alesp', 'Assembleia Legislativa do Estado de São Paulo', 'https://www.al.sp.gov.br', null),
    ('governo-sp', 'Governo do Estado de São Paulo', 'https://www.sp.gov.br', null),
    ('transparencia-sp', 'Portal da Transparência do Estado de São Paulo', 'https://www.transparencia.sp.gov.br', null),
    ('transparencia-federal', 'Portal da Transparência do Governo Federal', 'https://portaldatransparencia.gov.br', null),
    ('tce-sp', 'Tribunal de Contas do Estado de São Paulo', 'https://www.tce.sp.gov.br', null),
    ('tcm-sp', 'Tribunal de Contas do Município de São Paulo', 'https://www.tcm.sp.gov.br', null),
    ('diario-oficial-sp', 'Imprensa Oficial do Estado de São Paulo', 'https://www.imprensaoficial.com.br', null),
    ('camara-municipal-sp', 'Câmara Municipal de São Paulo', 'https://www.saopaulo.sp.leg.br', null),
    ('prefeitura-sao-paulo', 'Prefeitura do Município de São Paulo', 'https://prefeitura.sp.gov.br', null)
)
insert into public.sources (
  official_source_id,
  publisher,
  url,
  data_url,
  evidence_kind,
  collected_at,
  verified,
  verified_at,
  notes
)
select
  c.official_source_id,
  c.publisher,
  c.url,
  c.data_url,
  'dado_oficial'::public.evidence_kind,
  now(),
  true,
  now(),
  'Registro de catálogo institucional (src/config/sources.ts). Página oficial do órgão, não dado político coletado.'
from catalogo c
where not exists (
  select 1
  from public.sources s
  where s.official_source_id = c.official_source_id
    and s.url = c.url
);

-- Conferência do seed: quantas fontes de catálogo existem após a execução.
select count(*) as fontes_de_catalogo
from public.sources
where official_source_id is not null;
