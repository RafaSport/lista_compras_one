"use client";

import { useEffect, useRef } from "react";

export type Aviso = { texto: string; chave: number };

type Props = {
  mensagem: Aviso | null;
  aoFechar: () => void;
  duracaoMs?: number;
};

// Aviso central e transitório. Cobre a tela com o formulário ao fundo,
// fica visível por alguns segundos e desaparece sozinho.
// Sem botão de fechar: o usuário não precisa agir para se livrar do aviso.
export function AvisoCentral({ mensagem, aoFechar, duracaoMs = 3000 }: Props) {
  // O callback fica em ref para o efeito não depender da identidade da função.
  const aoFecharRef = useRef(aoFechar);
  aoFecharRef.current = aoFechar;

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