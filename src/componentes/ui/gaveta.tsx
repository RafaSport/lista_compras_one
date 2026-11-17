"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  // Lado de onde a gaveta desliza
  lado?: "direita" | "esquerda";
  className?: string;
};

// Painel lateral deslizante, usado para navegação no mobile e para
// formulários secundários. Fecha com Esc, clique no fundo ou botão fechar.
export function Gaveta({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  lado = "direita",
  className,
}: Props) {
  const painelRef = useRef<HTMLDivElement>(null);
  const elementoAnteriorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;

    // Guarda quem tinha o foco para devolver depois
    elementoAnteriorRef.current = document.activeElement as HTMLElement | null;
    painelRef.current?.focus();

    // Trava o scroll do fundo enquanto a gaveta está aberta
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }

    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
      elementoAnteriorRef.current?.focus();
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      {/* Fundo escurecido */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gaveta-titulo"
        aria-describedby={descricao ? "gaveta-descricao" : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex h-full w-full max-w-sm flex-col border-border bg-sidebar shadow-xl",
          "focus:outline-none",
          lado === "direita" ? "ml-auto border-l" : "mr-auto border-r",
          className,
        )}
      >
        {/* Cabeçalho fixo */}
        <div className="flex items-start justify-between gap-3 border-b border-sidebar-border p-4">
          <div className="flex flex-col gap-0.5">
            <h2
              id="gaveta-titulo"
              className="text-base font-semibold text-sidebar-foreground"
            >
              {titulo}
            </h2>
            {descricao && (
              <p
                id="gaveta-descricao"
                className="text-xs text-muted-foreground"
              >
                {descricao}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="shrink-0 rounded-sm px-1 text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
          >
            ×
          </button>
        </div>

        {/* Conteúdo com scroll próprio */}
        <div className="flex-1 overflow-y-auto p-4 text-sidebar-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}