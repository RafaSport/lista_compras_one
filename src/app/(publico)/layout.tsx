import type { ReactNode } from "react";

// Casca das rotas públicas (login e cadastro).
// O cabeçalho mora em cada tela, porque o subtítulo muda entre elas.
export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex h-full flex-col overflow-hidden px-4">
      {/* Conteúdo no topo, não centralizado: com justify-center o topo fica
          inacessível quando o conteúdo passa da altura disponível.
          O overflow-y-auto é rede de segurança — se tudo couber, não aparece barra. */}
      <div className="mx-auto min-h-0 w-full max-w-sm flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}