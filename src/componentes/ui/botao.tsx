"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/lib/utilitarios";

type Variante = "primario" | "secundario" | "fantasma" | "perigo";
type Tamanho = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
  larguraTotal?: boolean;
};

// Estilos base compartilhados por todas as variações
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const variantes: Record<Variante, string> = {
  primario: "bg-primary text-primary-foreground hover:bg-primary/90",
  secundario:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  fantasma: "bg-transparent text-foreground hover:bg-accent",
  perigo: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Botao = forwardRef<HTMLButtonElement, Props>(function Botao(
  {
    variante = "primario",
    tamanho = "md",
    carregando = false,
    larguraTotal = false,
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
      // Bloqueia clique duplo enquanto a ação está em andamento
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cn(
        base,
        variantes[variante],
        tamanhos[tamanho],
        larguraTotal && "w-full",
        className,
      )}
      {...resto}
    >
      {carregando && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});