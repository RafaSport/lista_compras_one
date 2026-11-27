import type { ReactNode } from "react";
import { IconeCarrinho } from "@/components/ui/icone-carrinho";

// Casca das rotas públicas (login e cadastro).
// Cabeçalho fixo, miolo com rolagem própria. A página nunca rola.
export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex h-full flex-col overflow-hidden px-4">
      {/* Cabeçalho fixo: não encolhe nem rola */}
      <div className="flex shrink-0 flex-col items-center pt-6 pb-4 text-center">
        <IconeCarrinho className="text-primary mb-2 size-10" />

        <h1 className="text-primary text-2xl font-semibold tracking-tight">Lista de Compras</h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Compare preços por litro, quilo e unidade.
        </p>
      </div>

      {/* Miolo: ocupa o resto e rola sozinho quando o conteúdo não couber */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}