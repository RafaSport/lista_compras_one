import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BarraInferior } from "@/components/navegacao/barra-inferior";

// Casca de todas as rotas privadas.
// Verifica a sessão no servidor antes de renderizar qualquer tela protegida.
// Se não houver sessão, redireciona para /login (RF20).
export default async function LayoutProtegido({ children }: { children: ReactNode }) {
  const sessao = await auth();

  if (!sessao?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Área de conteúdo. O padding inferior abre espaço para a barra fixa. */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-6">{children}</main>

      {/* Barra de navegação inferior com os cinco atalhos do doc 02. */}
      <BarraInferior />
    </div>
  );
}