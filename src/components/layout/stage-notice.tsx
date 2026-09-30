import { StatusTag } from "@/components/ui/status-tag";
import { MISSING_DATA_NOTE } from "@/lib/evidence";
import { cn } from "@/lib/utils";

/**
 * Aviso do estágio atual do projeto.
 *
 * Deixa explícito para o usuário que a base ainda não tem dados publicados e
 * que nada será exibido sem fonte verificada — evitando a impressão de que a
 * plataforma "não achou nada" ou de que existe dado oculto.
 */
export function StageNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-brand-200 bg-brand-50 p-4 sm:p-5",
        className,
      )}
    >
      <StatusTag tone="info">Base em coleta</StatusTag>
      <p className="mt-2 text-sm text-ink-800">
        A plataforma está em construção e as áreas de dados estão vazias de
        propósito. Nenhum político, projeto, votação, gasto, emenda ou notícia é
        exibido antes de ser registrado com fonte oficial verificada.
      </p>
      <p className="mt-2 text-xs text-ink-600">{MISSING_DATA_NOTE}</p>
    </div>
  );
}
