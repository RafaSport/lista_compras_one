"use client";

import type { LabelHTMLAttributes } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = LabelHTMLAttributes<HTMLLabelElement> & {
  obrigatorio?: boolean;
};

// Rótulo de campo. O asterisco é apenas visual; a obrigatoriedade real
// deve vir do atributo required no input, para o leitor de tela anunciar.
export function Rotulo({
  obrigatorio = false,
  className,
  children,
  ...resto
}: Props) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...resto}
    >
      {children}
      {obrigatorio && (
        <span aria-hidden="true" className="ml-0.5 text-destructive">
          *
        </span>
      )}
    </label>
  );
}