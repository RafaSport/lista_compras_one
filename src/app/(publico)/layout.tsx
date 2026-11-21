import type { ReactNode } from "react";
import { IconeCarrinho } from "@/components/ui/icone-carrinho";

// Casca das rotas públicas (login e cadastro).
// h-full + overflow-hidden: nunca gera rolagem, mesmo em tela pequena.
export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex h-full items-center justify-center overflow-hidden px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* Ícone na cor primária, igual ao botão Entrar */}
          <IconeCarrinho className="text-primary mb-2 size-10" />

          {/* Título na cor primária */}
          <h1 className="text-primary text-2xl font-semibold tracking-tight">Lista de Compras</h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Compare preços por litro, quilo e unidade.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}