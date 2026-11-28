"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Botao } from "@/components/ui/botao";
import { IconeCarrinho } from "@/components/ui/icone-carrinho";
import { Separador } from "@/components/ui/separador";
import { Saudacao } from "@/components/navegacao/saudacao";

// Cabeçalho fixo das telas privadas.
// Três colunas: app à esquerda, saudação no centro, ação de sair à direita.
export function Cabecalho() {
  return (
    <>
      <header className="bg-background grid grid-cols-3 items-center gap-2 px-4 py-3">
        <Link href="/inicio" className="text-primary flex items-center gap-2 justify-self-start">
          <IconeCarrinho className="size-5 shrink-0" />
          <span className="hidden text-sm font-semibold sm:inline">Lista de Compras</span>
        </Link>

        <Saudacao />

        <Botao
          variante="perigo"
          tamanho="sm"
          className="justify-self-end"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sair
        </Botao>
      </header>

      <Separador />
    </>
  );
}
