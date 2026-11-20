"use client";

import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Variante = "erro" | "sucesso" | "aviso" | "info";

type Props = {
  variante?: Variante;
  children: ReactNode;
  className?: string;
};

// Cada variante usa os tokens de feedback definidos no globals.css
const variantes: Record<Variante, string> = {
  erro: "bg-destructive/10 text-destructive border-destructive/30",
  sucesso: "bg-success/10 text-success border-success/30",
  aviso: "bg-warning/10 text-warning border-warning/30",
  info: "bg-info/10 text-info border-info/30",
};

// Ícone simples por variante, sem dependência externa
const icones: Record<Variante, string> = {
  erro: "!",
  sucesso: "✓",
  aviso: "!",
  info: "i",
};

export function Mensagem({ variante = "info", children, className }: Props) {
  return (
    <div
      // role="alert" faz o leitor de tela anunciar a mensagem assim que aparece
      role={variante === "erro" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        variantes[variante],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold"
      >
        {icones[variante]}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
