import { cn } from "@/app/lib/utilitarios";

type Props = {
  orientacao?: "horizontal" | "vertical";
  rotulo?: string;
  className?: string;
};

// Linha divisória. Com rótulo, exibe o texto centralizado sobre a linha
// (útil para separar blocos de formulário).
export function Separador({ orientacao = "horizontal", rotulo, className }: Props) {
  if (orientacao === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("bg-border h-full w-px", className)}
      />
    );
  }

  // Com rótulo: linha à esquerda, texto, linha à direita
  if (rotulo) {
    return (
      <div role="separator" className={cn("flex items-center gap-3", className)}>
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {rotulo}
        </span>
        <span className="bg-border h-px flex-1" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("bg-border h-px w-full", className)}
    />
  );
}
