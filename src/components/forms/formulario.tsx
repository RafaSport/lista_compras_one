"use client";

import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";
import { Mensagem } from "@/components/ui/mensagem";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  erroGeral?: string | null;
  sucesso?: string | null;
  children: ReactNode;
};

// Casca de formulário: trata o envio, exibe erro geral e mensagem de sucesso.
// Sem rolagem própria: quem rola, se necessário, é a casca da página.
export function Formulario({ erroGeral, sucesso, children, className, ...resto }: Props) {
  return (
    <form
      // noValidate desliga a validação nativa do navegador;
      // quem valida é o Zod, para manter a mensagem consistente
      noValidate
      className={cn(
        "border-primary/30 flex flex-col gap-3 rounded-md border-[0.3px] p-3",
        // Em telas baixas o espaçamento encolhe antes de qualquer rolagem aparecer
        "[@media(max-height:600px)]:gap-2 [@media(max-height:600px)]:p-2",
        className,
      )}
      {...resto}
    >
      {erroGeral && <Mensagem variante="erro">{erroGeral}</Mensagem>}
      {sucesso && <Mensagem variante="sucesso">{sucesso}</Mensagem>}
      {children}
    </form>
  );
}