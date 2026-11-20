import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = ComponentProps<typeof Link> & {
  variante?: "padrao" | "discreto";
};

// Link de texto usado dentro de parágrafos e rodapés de formulário.
// A variante "discreto" serve para ações secundárias, como "esqueci a senha".
const variantes = {
  padrao: "text-primary underline underline-offset-4 hover:text-primary/80",
  discreto: "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
};

export function LinkTexto({ variante = "padrao", className, ...resto }: Props) {
  return (
    <Link
      className={cn("rounded-sm font-medium transition-colors", variantes[variante], className)}
      {...resto}
    />
  );
}
