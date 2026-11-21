import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BarraInferior } from "@/components/navegacao/barra-inferior";
import { Cabecalho } from "@/components/navegacao/cabecalho";

// Casca de todas as rotas privadas.
// Verifica a sessão no servidor antes de renderizar qualquer tela protegida.
// Se não houver sessão, redireciona para /login (RF20).
export default async function LayoutProtegido({ children }: { children: ReactNode }) {
  const sessao = await auth();

  if (!sessao?.user) {
    redirect("/login");
  }

  return (
    // h-full + overflow-hidden: a casca nunca rola.
    // A área do main é a única que pode rolar, e só se o conteúdo exceder.
    <div className="bg-background flex h-full flex-col overflow-hidden">
      {/* Cabeçalho fixo com o ícone pequeno no canto esquerdo */}
      <Cabecalho />

      {/* Área de conteúdo. min-h-0 permite encolher; overflow-y-auto só age se precisar. */}
      <main className="mx-auto min-h-0 w-full max-w-md flex-1 overflow-y-auto px-4 py-4">
        {children}
      </main>

      {/* Barra de navegação inferior com os cinco atalhos do doc 02. */}
      <BarraInferior />
    </div>
  );
}