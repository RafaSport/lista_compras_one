import { cn } from "@/app/lib/utilitarios";
import type { CorLista } from "@/types/banco-local";

type Props = {
  nome: string;
  cor?: CorLista;
  className?: string;
};

// Círculo colorido com a primeira letra do nome.
// Usa a cor da lista quando informada; caso contrário, deriva do texto.
const classesCor: Record<CorLista, string> = {
  verde: "bg-emerald-500",
  azul: "bg-blue-500",
  laranja: "bg-orange-500",
  roxo: "bg-violet-500",
  vermelho: "bg-red-500",
  amarelo: "bg-amber-400",
  ciano: "bg-cyan-500",
  rosa: "bg-pink-500",
};

const paletaPadrao = Object.values(classesCor);

function corDoNome(nome: string) {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) {
    soma += nome.charCodeAt(i);
  }
  return paletaPadrao[soma % paletaPadrao.length];
}

export function AvatarLetra({ nome, cor, className }: Props) {
  const letra = nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
        cor ? classesCor[cor] : corDoNome(nome),
        className,
      )}
    >
      {letra}
    </span>
  );
}