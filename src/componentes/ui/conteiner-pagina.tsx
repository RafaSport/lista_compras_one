import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = {
  children: ReactNode;
  // Largura máxima do conteúdo; "estreito" serve para formulários e leitura
  largura?: "estreito" | "padrao" | "largo";
  className?: string;
};

const larguras = {
  estreito: "max-w-2xl",
  padrao: "max-w-5xl",
  largo: "max-w-7xl",
};

// Envolve o conteúdo de uma página com padding e largura máxima.
// Centraliza no desktop e mantém respiro nas laterais no mobile.
export function ConteinerPagina({ children, largura = "padrao", className }: Props) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 sm:px-6", larguras[largura], className)}>
      {children}
    </div>
  );
}
