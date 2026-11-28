"use client";

import { cn } from "@/app/lib/utilitarios";
import { coresLista } from "@/schemas/cadastros";
import type { CorLista } from "@/types/banco-local";

type Props = {
  valor: CorLista | null;
  aoMudar: (cor: CorLista) => void;
  erro?: string;
};

// Mapa de cor salva (nome) para a classe Tailwind de fundo.
const classesCor: Record<CorLista, string> = {
  verde: "bg-emerald-500",
  azul: "bg-blue-500",
  laranja: "bg-orange-500",
  roxo: "bg-violet-500",
  vermelho: "bg-red-500",
  amarelo: "bg-amber-400",
  rosa: "bg-pink-500",
};

const rotulos: Record<CorLista, string> = {
  verde: "Verde",
  azul: "Azul",
  laranja: "Laranja",
  roxo: "Roxo",
  vermelho: "Vermelho",
  amarelo: "Amarelo",
  rosa: "Rosa",
};

// Seletor de cor em grade fixa de 4 colunas.
// Sete cores ocupam duas linhas, sem gerar rolagem em telas pequenas.
export function SeletorCor({ valor, aoMudar, erro }: Props) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-foreground pb-2 text-sm font-medium">Cor da Lista</legend>

      <div role="radiogroup" aria-label="Cor da lista" className="grid grid-cols-7 gap-x-2 gap-y-2">
        {coresLista.map((cor) => {
          const selecionada = valor === cor;

          return (
            <button
              key={cor}
              type="button"
              role="radio"
              aria-checked={selecionada}
              aria-label={rotulos[cor]}
              onClick={() => aoMudar(cor)}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "size-7 rounded-full transition-all",
                  classesCor[cor],
                  selecionada
                    ? "ring-foreground ring-offset-background ring-2 ring-offset-2"
                    : "opacity-70 hover:opacity-100",
                )}
              />
              <span
                className={cn(
                  "text-[10px] leading-none",
                  selecionada ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {rotulos[cor]}
              </span>
            </button>
          );
        })}
      </div>

      {erro && (
        <p role="alert" className="text-destructive text-xs">
          {erro}
        </p>
      )}
    </fieldset>
  );
}
