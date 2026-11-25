import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = {
  href: string;
  rotulo: string;
  valor: number | string;
  icone: ReactNode;
  carregando?: boolean;
  className?: string;
};

// Card de resumo clicável, usado lado a lado na tela de Início.
// O valor é o destaque; o rótulo fica abaixo, discreto.
export function CardResumo({ href, rotulo, valor, icone, carregando, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "border-border bg-card flex flex-1 flex-col gap-2 rounded-lg border p-4",
        "hover:bg-accent transition-colors",
        className,
      )}
    >
      <span className="text-muted-foreground" aria-hidden>
        {icone}
      </span>

      <span className="text-card-foreground text-2xl font-semibold">
        {carregando ? "—" : valor}
      </span>

      <span className="text-muted-foreground text-xs">{rotulo}</span>
    </Link>
  );
}