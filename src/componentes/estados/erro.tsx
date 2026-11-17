"use client";

import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";
import { Botao } from "@/componentes/ui/botao";

type Props = {
  titulo?: string;
  descricao?: string;
  aoTentarNovamente?: () => void;
  carregando?: boolean;
  icone?: ReactNode;
  className?: string;
};

// Estado de falha ao buscar dados. Sempre oferece uma saída:
// repetir a operação, para o usuário não ficar preso na tela.
export function Erro({
  titulo = "Não foi possível carregar",
  descricao = "Verifique sua conexão e tente novamente.",
  aoTentarNovamente,
  carregando = false,
  icone,
  className,
}: Props) {
  return (
    <div
      // role="alert" faz o leitor de tela anunciar a falha
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center",
        className,
      )}
    >
      <div aria-hidden="true" className="text-destructive">
        {icone ?? (
          <span className="flex size-10 items-center justify-center rounded-full border border-current text-lg font-bold">
            !
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">{titulo}</p>
        <p className="max-w-sm text-xs text-muted-foreground">{descricao}</p>
      </div>

      {aoTentarNovamente && (
        <Botao
          variante="secundario"
          tamanho="sm"
          onClick={aoTentarNovamente}
          carregando={carregando}
          className="mt-1"
        >
          Tentar novamente
        </Botao>
      )}
    </div>
  );
}