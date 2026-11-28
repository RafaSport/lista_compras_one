import Link from "next/link";
import { IconeCarrinho } from "@/components/ui/icone-carrinho";

// Página 404 personalizada.
// Mesma composição visual do loading, trocando a animação por um aviso e um botão de retorno.
export default function NaoEncontrada() {
  return (
    <div className="bg-background flex h-full flex-col items-center justify-center gap-6 px-4">
      <IconeCarrinho size={72} className="text-primary" />

      <h1 className="text-foreground text-2xl font-semibold tracking-tight">Lista de Compras</h1>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-foreground text-sm font-medium">Página não encontrada</p>
        <p className="text-muted-foreground text-xs">
          O endereço que você tentou abrir não existe.
        </p>
      </div>

      <Link
        href="/inicio"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2 text-sm font-medium transition-colors"
      >
        Ir para o início
      </Link>
    </div>
  );
}
