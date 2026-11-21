import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Variante = "sucesso" | "informacao" | "atencao" | "erro";

type Props = {
  variante: Variante;
  children: ReactNode;
  className?: string;
};

// Mensagem de feedback com borda e texto coloridos.
// Quatro variantes: sucesso (verde), informacao (azul), atencao (amarelo), erro (vermelho).
const estilos: Record<Variante, string> = {
  sucesso: "border-success/40 bg-success/10 text-success",
  informacao: "border-info/40 bg-info/10 text-info",
  atencao: "border-warning/40 bg-warning/10 text-warning",
  erro: "border-destructive/40 bg-destructive/10 text-destructive",
};

// Papel acessível por variante. Erro e atenção são anunciados como alerta.
const papeis: Record<Variante, "status" | "alert"> = {
  sucesso: "status",
  informacao: "status",
  atencao: "alert",
  erro: "alert",
};

export function Alerta({ variante, children, className }: Props) {
  return (
    <div
      role={papeis[variante]}
      className={cn("rounded-lg border px-3 py-2 text-sm", estilos[variante], className)}
    >
      {children}
    </div>
  );
}