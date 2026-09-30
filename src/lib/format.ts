/**
 * Formatação de datas e números em pt-BR.
 *
 * Regras de honestidade aplicadas aqui:
 * - funções de formatação retornam `null` quando não existe valor, para que a
 *   interface mostre o rótulo de dado ausente em vez de um "0" ou "R$ 0,00"
 *   que passaria a impressão de dado coletado;
 * - datas sem horário (`AAAA-MM-DD`) são exibidas como a data civil enviada
 *   pela fonte (sem conversão de fuso, que poderia trocar o dia);
 * - datas com horário (timestamps) são exibidas no fuso de Brasília.
 */

const LOCALE = "pt-BR";
const TIME_ZONE = "America/Sao_Paulo";
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isDateOnly(value: DateInput): boolean {
  return typeof value === "string" && DATE_ONLY_PATTERN.test(value.trim());
}

/** Data civil, ex.: `15/03/2022`. Retorna `null` se não houver data válida. */
export function formatDate(value: DateInput): string | null {
  const date = toDate(value);
  if (!date) return null;

  const timeZone = isDateOnly(value) ? "UTC" : TIME_ZONE;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  }).format(date);
}

/** Data e hora, ex.: `15/03/2022 14:30`. Retorna `null` se não houver data válida. */
export function formatDateTime(value: DateInput): string | null {
  const date = toDate(value);
  if (!date) return null;

  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Valor monetário em reais, ex.: `R$ 1.234,56`. */
export function formatCurrencyBRL(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;

  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Número inteiro com separador de milhar, ex.: `12.345`. */
export function formatInteger(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;

  return new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 0,
  }).format(value);
}

/** Percentual, ex.: `84,2%` (espera o valor já em escala 0–100). */
export function formatPercent(
  value: number | null | undefined,
  fractionDigits = 1,
): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;

  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

/**
 * Período de um mandato/cargo, ex.: `01/02/2019 – 31/01/2023` ou
 * `01/02/2019 – em curso` quando não há data final (com `endLabel` informado).
 * Retorna `null` se nem a data inicial existir — a interface então exibe
 * "Não coletado".
 */
export function formatPeriod(
  start: DateInput,
  end: DateInput,
  endLabel = "em curso",
): string | null {
  const startLabel = formatDate(start);
  if (!startLabel) return null;

  const endFormatted = formatDate(end);
  return `${startLabel} – ${endFormatted ?? endLabel}`;
}
