"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utilitarios";

type Item = {
  href: string;
  rotulo: string;
  icone: (props: { className?: string }) => React.ReactElement;
};

const itens: Item[] = [
  { href: "/inicio", rotulo: "Início", icone: IconeInicio },
  { href: "/listas", rotulo: "Listas", icone: IconeListas },
  { href: "/compras", rotulo: "Compras", icone: IconeCompras },
  { href: "/historico", rotulo: "Histórico", icone: IconeHistorico },
  { href: "/estatisticas", rotulo: "Estatísticas", icone: IconeEstatisticas },
];

// Barra de navegação inferior com os cinco atalhos.
// O item ativo recebe uma pílula com contorno e a cor verde do tema.
export function BarraInferior() {
  const caminho = usePathname();

  return (
    <nav className="border-border bg-background flex items-center justify-around gap-1 border-t px-2 py-2">
      {itens.map((item) => {
        const ativo = caminho === item.href || caminho.startsWith(`${item.href}/`);
        const Icone = item.icone;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1.5 transition-colors",
              ativo
                ? "border-border text-primary border"
                : "text-muted-foreground hover:text-foreground border border-transparent",
            )}
          >
            <Icone className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.rotulo}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function IconeInicio({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconeListas({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function IconeCompras({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconeHistorico({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconeEstatisticas({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
