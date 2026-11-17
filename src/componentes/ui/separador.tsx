import { cn } from "@/app/lib/utilitarios";

type Props = {
  orientacao?: "horizontal" | "vertical";
  rotulo?: string;
  className?: string;
};

// Linha divisória. Com rótulo, exibe o texto centralizado sobre a linha
// (útil para separar blocos de formulário).
export function Separador({
  orientacao = "horizontal",
  rotulo,
  className,
}: Props) {
  if (orientacao === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("h-full w-px bg-border", className)}
      />
    );
  }

  // Com rótulo: linha à esquerda, texto, linha à direita
  if (rotulo) {
    return (
      <div
        role="separator"
        className={cn("flex items-center gap-3", className)}
      >
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {rotulo}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-border", className)}
    />
  );
}