import { cn } from "@/app/lib/utilitarios";

type Props = {
  variante?: "linha" | "cartao" | "lista";
  quantidade?: number;
  className?: string;
};

// Bloco cinza animado que ocupa o lugar do conteúdo enquanto ele carrega.
// Evita o "pulo" de layout quando os dados chegam.
function Bloco({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("bg-muted animate-pulse rounded-md", className)} />;
}

export function Esqueleto({ variante = "linha", quantidade = 3, className }: Props) {
  // Leitor de tela anuncia que algo está carregando
  const rotulo = <span className="sr-only">Carregando...</span>;

  if (variante === "cartao") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {rotulo}
        {Array.from({ length: quantidade }).map((_, i) => (
          <div key={i} className="border-border bg-card rounded-xl border p-4">
            <Bloco className="h-4 w-1/3" />
            <Bloco className="mt-3 h-3 w-2/3" />
            <Bloco className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variante === "lista") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {rotulo}
        {Array.from({ length: quantidade }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bloco className="size-8 shrink-0 rounded-full" />
            <Bloco className="h-3 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {rotulo}
      {Array.from({ length: quantidade }).map((_, i) => (
        <Bloco key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
