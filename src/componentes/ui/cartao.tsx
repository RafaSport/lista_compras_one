import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Props = HTMLAttributes<HTMLDivElement> & {
  variante?: "padrao" | "interativo";
};

// Superfície base do app. "interativo" adiciona feedback visual de hover
// para quando o cartão inteiro é clicável.
const variantes = {
  padrao: "bg-card border-border",
  interativo:
    "bg-card border-border hover:border-primary/40 hover:bg-card/80 cursor-pointer transition-colors",
};

export function Cartao({ variante = "padrao", className, ...resto }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm",
        variantes[variante],
        className,
      )}
      {...resto}
    />
  );
}

// Cabeçalho do cartão: título e descrição opcional
export function CartaoCabecalho({
  titulo,
  descricao,
  acao,
  className,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-card-foreground">{titulo}</h3>
        {descricao && (
          <p className="text-xs text-muted-foreground">{descricao}</p>
        )}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}

// Corpo do cartão: conteúdo principal
export function CartaoConteudo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mt-3", className)}>{children}</div>;
}

// Rodapé do cartão: ações alinhadas à direita
export function CartaoRodape({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-4 flex items-center justify-end gap-2 border-t border-border pt-3",
        className,
      )}
    >
      {children}
    </div>
  );
}