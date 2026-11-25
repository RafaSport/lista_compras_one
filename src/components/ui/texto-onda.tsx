import { cn } from "@/app/lib/utilitarios";

type Props = {
  texto: string;
  className?: string;
};

// Cada letra pulsa com atraso progressivo, criando uma onda da esquerda para a direita.
export function TextoOnda({ texto, className }: Props) {
  return (
    <span className={cn("inline-flex", className)} aria-label={texto}>
      {texto.split("").map((letra, indice) => (
        <span
          key={`${letra}-${indice}`}
          aria-hidden
          className="animate-onda-texto inline-block"
          style={{ animationDelay: `${indice * 80}ms` }}
        >
          {letra === " " ? "\u00A0" : letra}
        </span>
      ))}
    </span>
  );
}