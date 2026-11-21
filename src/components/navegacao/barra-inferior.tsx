"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utilitarios";

// Os cinco atalhos definidos no docs/02-navegacao.md, seção 1.
const atalhos = [
  { href: "/", rotulo: "Início", icone: "🏠" },
  { href: "/compras/nova", rotulo: "Nova", icone: "➕" },
  { href: "/historico", rotulo: "Histórico", icone: "📋" },
  { href: "/comparar", rotulo: "Comparar", icone: "⚖️" },
  { href: "/cadastros", rotulo: "Cadastros", icone: "🗂️" },
] as const;

// Barra de navegação no rodapé do fluxo (não é fixed).
// Como o layout raiz trava a altura, ela fica sempre visível sem sobrepor nada.
export function BarraInferior() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="border-border bg-background shrink-0 border-t"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-between px-2 py-1">
        {atalhos.map((atalho) => {
          const ativo =
            atalho.href === "/" ? caminho === "/" : caminho.startsWith(atalho.href);

          return (
            <li key={atalho.href} className="flex-1">
              <Link
                href={atalho.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-xs",
                  ativo ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {atalho.icone}
                </span>
                <span>{atalho.rotulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}