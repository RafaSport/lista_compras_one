import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = {
  children?: ReactNode;
  // Texto simples à esquerda, quando não há children
  texto?: string;
  className?: string;
};

// Rodapé discreto das telas. Usado para versão do app, links legais
// e informações de sincronização.
export function Rodape({ children, texto, className }: Props) {
  return (
    <footer
      className={cn(
        "border-border flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3",
        "text-muted-foreground text-xs",
        className,
      )}
    >
      {children ?? <span>{texto}</span>}
    </footer>
  );
}
