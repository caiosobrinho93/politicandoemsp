/**
 * Utilitário de composição de classes CSS.
 *
 * Mantido deliberadamente simples (sem dependências externas) para evitar
 * pacotes extras que não são necessários neste estágio do projeto.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
