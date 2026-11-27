import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BarraInferior } from "@/components/navegacao/barra-inferior";
import { Cabecalho } from "@/components/navegacao/cabecalho";

// Casca de todas as rotas privadas.
// Verifica a sessão no servidor antes de renderizar qualquer tela protegida.
async function ConteudoProtegido({ children }: { children: ReactNode }) {
  const sessao = await auth();

  if (!sessao?.user) {
    redirect("/login");
  }

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden">
      {/* Cabeçalho já traz a própria linha divisória abaixo dele */}
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

/** Isola a leitura da sessão para o Next.js renderizar um fallback durante o build. */
export default function LayoutProtegido({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-full items-center justify-center">
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      }
    >
      <ConteudoProtegido>{children}</ConteudoProtegido>
    </Suspense>
  );
}