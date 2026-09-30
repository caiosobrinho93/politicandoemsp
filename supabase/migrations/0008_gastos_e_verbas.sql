-- =============================================================================
-- 0008 — Gastos, verbas e emendas (tarefa 2.7)
--
-- Valores são numéricos exatos (numeric), nunca float: dinheiro público não pode
-- sofrer erro de arredondamento binário. Valor não coletado é NULL (R0.9).
-- =============================================================================

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians (id) on delete cascade,
  category public.expense_category not null,
  -- Órgão pagador conforme a fonte (ex.: nome da casa legislativa).
  paying_agency text not null,
  description text not null,
  amount numeric(14, 2) not null,
  -- Mês de competência informado pela fonte: sempre o primeiro dia do mês.
  reference_month date not null,
  -- Fonte única e obrigatória, como no tipo de domínio `Expense.source`.
  source_id uuid not null references public.sources (id) on delete restrict,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_amount_not_negative check (amount >= 0),
  constraint expenses_paying_agency_not_blank check (btrim(paying_agency) <> ''),
  constraint expenses_description_not_blank check (btrim(description) <> ''),
  constraint expenses_reference_month_is_first_day check (extract(day from reference_month) = 1),
  constraint expenses_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.expenses is
  'Gastos registrados em fonte oficial (cota parlamentar, diárias, remuneração etc.).';
comment on column public.expenses.reference_month is
  'Primeiro dia do mês de competência informado pela fonte, sem conversão de fuso.';

create index expenses_politician_month_idx
  on public.expenses (politician_id, reference_month desc);
create index expenses_category_idx on public.expenses (category, reference_month desc);
create index expenses_source_idx on public.expenses (source_id);

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

create trigger expenses_require_source
  before insert or update on public.expenses
  for each row execute function public.enforce_source_before_publish('self');

-- -----------------------------------------------------------------------------
-- Verbas e emendas: destinação de recursos públicos.
-- `paid_amount` fica NULL quando a fonte não publica o valor pago.
-- -----------------------------------------------------------------------------
create table public.public_funds (
  id uuid primary key default gen_random_uuid(),
  kind public.public_fund_kind not null,
  -- NULL quando a fonte não atribui o recurso a um parlamentar específico.
  politician_id uuid references public.politicians (id) on delete set null,
  granting_agency text not null,
  beneficiary text not null,
  purpose text not null,
  amount numeric(16, 2) not null,
  paid_amount numeric(16, 2),
  reference_year integer not null,
  evidence_kind public.evidence_kind not null default 'dado_oficial',
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_funds_amount_not_negative check (amount >= 0),
  constraint public_funds_paid_amount_not_negative check (
    paid_amount is null or paid_amount >= 0
  ),
  constraint public_funds_reference_year_range check (reference_year between 1900 and 2200),
  constraint public_funds_beneficiary_not_blank check (btrim(beneficiary) <> ''),
  constraint public_funds_purpose_not_blank check (btrim(purpose) <> ''),
  constraint public_funds_evidence_kind_fixed check (evidence_kind = 'dado_oficial')
);

comment on table public.public_funds is
  'Emendas, convênios, contratos e transferências, com órgão concedente e beneficiário conforme a fonte.';

create index public_funds_politician_idx
  on public.public_funds (politician_id, reference_year desc);
create index public_funds_kind_idx on public.public_funds (kind, reference_year desc);

create trigger public_funds_set_updated_at
  before update on public.public_funds
  for each row execute function public.set_updated_at();

create trigger public_funds_require_source
  before insert or update on public.public_funds
  for each row execute function public.enforce_source_before_publish('public_fund');
