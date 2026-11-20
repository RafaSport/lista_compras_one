"use client";

import type { LabelHTMLAttributes } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = LabelHTMLAttributes<HTMLLabelElement> & {
  obrigatorio?: boolean;
};

// Rótulo de campo. O asterisco é apenas visual; a obrigatoriedade real
// deve vir do atributo required no input, para o leitor de tela anunciar.
export function Rotulo({ obrigatorio = false, className, children, ...resto }: Props) {
  return (
    <label
      className={cn(
        "text-foreground text-sm font-medium",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...resto}
    >
      {children}
      {obrigatorio && (
        <span aria-hidden="true" className="text-destructive ml-0.5">
          *
        </span>
      )}
    </label>
  );
}
