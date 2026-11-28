import { cn } from "@/app/lib/utilitarios";

type Orientacao = "horizontal" | "vertical";

type Props = {
  orientacao?: Orientacao;
  className?: string;
};

// Linha divisória padrão do app.
// Horizontal ocupa toda a largura disponível e se adapta ao container.
// Vertical ocupa toda a altura disponível.
export function Separador({ orientacao = "horizontal", className }: Props) {
  const horizontal = orientacao === "horizontal";

  return (
    <div
      role="separator"
      aria-orientation={orientacao}
      className={cn("bg-border shrink-0", horizontal ? "h-px w-full" : "h-full w-px", className)}
    />
  );
}
