"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Botao } from "@/components/ui/botao";
import { IconeCarrinho } from "@/components/ui/icone-carrinho";
import { Separador } from "@/components/ui/separador";

// Cabeçalho fixo das telas privadas.
// Mostra o nome do app à esquerda e a ação de sair à direita.
export function Cabecalho() {
  return (
    <>
      <header className="bg-background flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/inicio" className="text-primary flex items-center gap-2">
          <IconeCarrinho className="size-5" />
          <span className="text-sm font-semibold">Lista de Compras</span>
        </Link>

        <Botao
          variante="perigo"
          tamanho="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sair
        </Botao>
      </header>

      <Separador />
    </>
  );
}
