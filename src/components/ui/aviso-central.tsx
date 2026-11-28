"use client";

import { useEffect, useRef } from "react";

export type Aviso = { texto: string; chave: number };

type Props = {
  mensagem: Aviso | null;
  aoFechar: () => void;
  duracaoMs?: number;
};

export function AvisoCentral({ mensagem, aoFechar, duracaoMs = 3000 }: Props) {
  const aoFecharRef = useRef(aoFechar);

  // Guarda o callback mais recente. A escrita vai dentro de um efeito porque
  // o render precisa ser puro: escrever em ref durante o render é proibido.
  useEffect(() => {
    aoFecharRef.current = aoFechar;
  }, [aoFechar]);

  useEffect(() => {
    if (!mensagem) return;
    const id = setTimeout(() => aoFecharRef.current(), duracaoMs);
    return () => clearTimeout(id);
  }, [mensagem, duracaoMs]);

  if (!mensagem) return null;

  return (
    <div
      // fixed ignora o overflow-hidden dos layouts: cobre a viewport inteira
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
      role="alert"
    >
      <div className="border-destructive/40 bg-card w-full max-w-xs rounded-xl border p-4 text-center">
        <span
          aria-hidden="true"
          className="border-destructive text-destructive mx-auto mb-2 flex size-8 items-center justify-center rounded-full border text-sm font-bold"
        >
          !
        </span>
        <p className="text-foreground text-sm">{mensagem.texto}</p>
      </div>
    </div>
  );
}