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
        "flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3",
        "text-xs text-muted-foreground",
        className,
      )}
    >
      {children ?? <span>{texto}</span>}
    </footer>
  );
}