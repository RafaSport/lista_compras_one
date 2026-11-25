import { cn } from "@/app/lib/utilitarios";

type Props = {
  nome: string;
  className?: string;
};

// Círculo colorido com a primeira letra do nome.
// A cor é derivada do próprio texto, então a mesma lista sempre recebe a mesma cor.
const cores = [
  "bg-red-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
];

function corDoNome(nome: string) {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) {
    soma += nome.charCodeAt(i);
  }
  return cores[soma % cores.length];
}

export function AvatarLetra({ nome, className }: Props) {
  const letra = nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
        corDoNome(nome),
        className,
      )}
    >
      {letra}
    </span>
  );
}