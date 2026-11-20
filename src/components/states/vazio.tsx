import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  icone?: ReactNode;
  className?: string;
};

// Estado exibido quando uma lista ou busca não retorna nada.
// Sempre oferece uma saída: uma ação para o usuário criar o primeiro item.
export function Vazio({ titulo, descricao, acao, icone, className }: Props) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      {icone && (
        <div aria-hidden="true" className="text-muted-foreground">
          {icone}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-foreground text-sm font-semibold">{titulo}</p>
        {descricao && <p className="text-muted-foreground max-w-sm text-xs">{descricao}</p>}
      </div>

      {acao && <div className="mt-1">{acao}</div>}
    </div>
  );
}
