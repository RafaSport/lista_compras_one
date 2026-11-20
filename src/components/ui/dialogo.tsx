"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";
import { Sobreposicao } from "@/components/ui/sobreposicao";
import { Botao } from "@/components/ui/botao";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children?: ReactNode;
  // Rótulo e ação do botão de confirmação; omitir para diálogo só informativo
  textoConfirmar?: string;
  aoConfirmar?: () => void;
  textoCancelar?: string;
  carregando?: boolean;
  varianteConfirmar?: "primario" | "perigo";
  className?: string;
};

// Diálogo modal controlado. Fecha com Esc, clique no fundo ou botão cancelar.
// O foco vai para o painel ao abrir e volta ao elemento anterior ao fechar.
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  textoConfirmar,
  aoConfirmar,
  textoCancelar = "Cancelar",
  carregando = false,
  varianteConfirmar = "primario",
  className,
}: Props) {
  const painelRef = useRef<HTMLDivElement>(null);
  const elementoAnteriorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;

    // Guarda quem tinha o foco para devolver depois
    elementoAnteriorRef.current = document.activeElement as HTMLElement | null;
    painelRef.current?.focus();

    // Trava o scroll do fundo enquanto o modal está aberto
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      // Clique no fundo fecha; clique dentro do painel não propaga
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      {/* Fundo escurecido */}
      <Sobreposicao />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        aria-describedby={descricao ? "dialogo-descricao" : undefined}
        tabIndex={-1}
        className={cn(
          "border-border bg-popover relative z-10 w-full max-w-md rounded-xl border p-5 shadow-xl",
          "focus:outline-none",
          className,
        )}
      >
        <h2 id="dialogo-titulo" className="text-popover-foreground text-base font-semibold">
          {titulo}
        </h2>

        {descricao && (
          <p id="dialogo-descricao" className="text-muted-foreground mt-1 text-sm">
            {descricao}
          </p>
        )}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <Botao variante="secundario" tamanho="sm" onClick={aoFechar} disabled={carregando}>
            {textoCancelar}
          </Botao>

          {textoConfirmar && aoConfirmar && (
            <Botao
              variante={varianteConfirmar}
              tamanho="sm"
              onClick={aoConfirmar}
              carregando={carregando}
            >
              {textoConfirmar}
            </Botao>
          )}
        </div>
      </div>
    </div>
  );
}
