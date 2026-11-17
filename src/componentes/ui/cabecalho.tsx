"use client";

import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = {
  titulo: string;
  descricao?: string;
  // Ação principal à direita (ex: botão "Novo item")
  acao?: ReactNode;
  // Botão de menu à esquerda, usado no mobile para abrir a gaveta
  aoAbrirMenu?: () => void;
  className?: string;
};

// Cabeçalho fixo das telas privadas. No mobile exibe o botão de menu;
// no desktop o menu fica na barra lateral, então o botão desaparece.
export function Cabecalho({
  titulo,
  descricao,
  acao,
  aoAbrirMenu,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      {aoAbrirMenu && (
        <button
          type="button"
          onClick={aoAbrirMenu}
          aria-label="Abrir menu"
          className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          {/* Ícone de menu em três linhas, sem dependência externa */}
          <span aria-hidden="true" className="flex flex-col gap-1">
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-base font-semibold text-foreground">
          {titulo}
        </h1>
        {descricao && (
          <p className="truncate text-xs text-muted-foreground">{descricao}</p>
        )}
      </div>

      {acao && <div className="shrink-0">{acao}</div>}
    </header>
  );
}