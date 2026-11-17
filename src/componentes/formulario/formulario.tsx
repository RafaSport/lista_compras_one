"use client";

import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";
import { Mensagem } from "@/componentes/ui/mensagem";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  erroGeral?: string | null;
  sucesso?: string | null;
  children: ReactNode;
};

// Casca de formulário: trata o envio, exibe erro geral e mensagem de sucesso.
// Os campos chegam como children, então o mesmo componente serve a qualquer form.
export function Formulario({
  erroGeral,
  sucesso,
  children,
  className,
  ...resto
}: Props) {
  return (
    <form
      // noValidate desliga a validação nativa do navegador;
      // quem valida é o Zod, para manter a mensagem consistente
      noValidate
      className={cn("flex flex-col gap-4", className)}
      {...resto}
    >
      {erroGeral && <Mensagem variante="erro">{erroGeral}</Mensagem>}
      {sucesso && <Mensagem variante="sucesso">{sucesso}</Mensagem>}

      {children}
    </form>
  );
}