"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/lib/utilitarios";
import { base, tamanhos, variantes } from "@/componentes/ui/variantes-botao";
import type { Tamanho, Variante } from "@/componentes/ui/variantes-botao";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
};

// Botão único do app. Cobre ação primária, secundária, perigo e link.
// Com carregando=true, desabilita e troca o conteúdo por um indicador.
export const Botao = forwardRef<HTMLButtonElement, Props>(function Botao(
  {
    variante = "primario",
    tamanho = "md",
    carregando = false,
    disabled,
    className,
    children,
    ...resto
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cn(base, variantes[variante], tamanhos[tamanho], className)}
      {...resto}
    >
      {carregando ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="sr-only">Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});