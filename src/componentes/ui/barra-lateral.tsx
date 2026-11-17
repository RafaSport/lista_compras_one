"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type ItemNavegacao = {
  rotulo: string;
  href: string;
  icone?: ReactNode;
};

type Props = {
  itens: ItemNavegacao[];
  // Conteúdo do rodapé da barra, ex: nome do usuário e botão de sair
  rodape?: ReactNode;
  className?: string;
};

// Navegação lateral fixa do desktop. No mobile ela é renderizada
// dentro da Gaveta, então aqui fica oculta abaixo do breakpoint md.
export function BarraLateral({ itens, rodape, className }: Props) {
  const caminhoAtual = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex",
        className,
      )}
    >
      {/* Cabeçalho da barra: identidade do app */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <span className="text-sm font-semibold text-sidebar-foreground">
          Lista de Compras
        </span>
      </div>

      {/* Lista de navegação */}
      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {itens.map((item) => {
            // Ativo quando o caminho atual é igual ou filho do href
            const ativo =
              caminhoAtual === item.href ||
              caminhoAtual.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    ativo
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  {item.icone && (
                    <span aria-hidden="true" className="shrink-0">
                      {item.icone}
                    </span>
                  )}
                  <span className="truncate">{item.rotulo}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé da barra */}
      {rodape && (
        <div className="border-t border-sidebar-border p-2">{rodape}</div>
      )}
    </aside>
  );
}