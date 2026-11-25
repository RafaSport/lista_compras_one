"use client";

import { useEffect } from "react";
import { Botao } from "@/components/ui/botao";

/** Exibe recuperação visível quando uma tela privada falha ao renderizar. */
export default function ErroRotaPrivada({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro ao renderizar uma tela privada:", error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col gap-3">
      <h1 className="text-foreground text-lg font-semibold">Não foi possível abrir esta tela.</h1>
      <p className="text-muted-foreground text-sm">
        Tente novamente. Se o problema continuar, saia da conta e entre novamente.
      </p>
      <Botao onClick={reset} className="w-full">
        Tentar novamente
      </Botao>
    </div>
  );
}
