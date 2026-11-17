"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/app/lib/utilitarios";
import { Rotulo } from "@/componentes/ui/rotulo";
import { Mensagem } from "@/componentes/ui/mensagem";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
};

// Campo de entrada completo: rótulo, input, dica e mensagem de erro.
// O forwardRef é necessário para funcionar com React Hook Form.
export const Campo = forwardRef<HTMLInputElement, Props>(function Campo(
  { rotulo, erro, dica, obrigatorio, id, className, ...resto },
  ref,
) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = `${idCampo}-erro`;
  const idDica = `${idCampo}-dica`;

  // Liga o input aos textos auxiliares para o leitor de tela
  const descritoPor = [erro ? idErro : null, dica ? idDica : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <Rotulo htmlFor={idCampo} obrigatorio={obrigatorio}>
        {rotulo}
      </Rotulo>

      <input
        ref={ref}
        id={idCampo}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor || undefined}
        className={cn(
          "h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-60",
          erro
            ? "border-destructive focus-visible:outline-destructive"
            : "border-input",
          className,
        )}
        {...resto}
      />

      {dica && !erro && (
        <p id={idDica} className="text-xs text-muted-foreground">
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