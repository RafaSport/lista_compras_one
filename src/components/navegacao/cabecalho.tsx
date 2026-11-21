import { IconeCarrinho } from "@/components/ui/icone-carrinho";

// Cabeçalho das telas privadas.
// Mostra o ícone do carrinho pequeno, no canto esquerdo, na cor primária.
export function Cabecalho() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-3">
        <IconeCarrinho className="text-primary size-6" />
        <span className="text-primary text-sm font-semibold">Lista de Compras</span>
      </div>
    </header>
  );
}