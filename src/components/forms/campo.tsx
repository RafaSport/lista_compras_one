"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/app/lib/utilitarios";
import { Rotulo } from "@/components/ui/rotulo";
import { Mensagem } from "@/components/ui/mensagem";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  // Tipo do input. Padrão "text". Use "password" para senhas.
  tipo?: "text" | "password" | "email" | "number" | "tel" | "search" | "url";
};

// Campo de entrada completo: rótulo, input, dica e mensagem de erro.
// Campos do tipo password ganham um botão de olho para mostrar/ocultar.
export const Campo = forwardRef<HTMLInputElement, Props>(function Campo(
  { rotulo, erro, dica, obrigatorio, tipo = "text", id, className, ...resto },
  ref,
) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = `${idCampo}-erro`;
  const idDica = `${idCampo}-dica`;

  // Controla se a senha está visível. Só tem efeito quando tipo === "password".
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const ehSenha = tipo === "password";
  const tipoEfetivo = ehSenha && senhaVisivel ? "text" : tipo;

  // Liga o input aos textos auxiliares para o leitor de tela
  const descritoPor = [erro ? idErro : null, dica ? idDica : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <Rotulo htmlFor={idCampo} obrigatorio={obrigatorio}>
        {rotulo}
      </Rotulo>

      {/* Envolve o input para posicionar o botão do olho dentro do campo */}
      <div className="relative">
        <input
          ref={ref}
          id={idCampo}
          type={tipoEfetivo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor || undefined}
          className={cn(
            "bg-background text-foreground h-10 w-full rounded-lg border px-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-ring transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-60",
            // Abre espaço à direita para o botão do olho não cobrir o texto
            ehSenha && "pr-10",
            erro ? "border-destructive focus-visible:outline-destructive" : "border-input",
            className,
          )}
          {...resto}
        />

        {/* Botão de mostrar/ocultar senha. Só aparece em campos de senha. */}
        {ehSenha && (
          <button
            type="button"
            onClick={() => setSenhaVisivel((v) => !v)}
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={senhaVisivel}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center"
          >
            {senhaVisivel ? (
              // Olho cortado: senha visível, clique para ocultar
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c5 0 9 4.5 9 7a11 11 0 0 1-2.4 3.6" />
                <path d="M6.2 6.2A11.6 11.6 0 0 0 3 12c0 2.5 4 7 9 7a10 10 0 0 0 4.2-.9" />
              </svg>
            ) : (
              // Olho aberto: senha oculta, clique para mostrar
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            )}
          </button>
        )}
      </div>

      {dica && !erro && (
        <p id={idDica} className="text-muted-foreground text-xs">
          {dica}
        </p>
      )}

      {erro && (
        <span id={idErro}>
          <Mensagem variante="erro" className="px-2 py-1 text-xs">
            {erro}
          </Mensagem>
        </span>
      )}
    </div>
  );
});