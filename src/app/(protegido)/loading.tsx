import { IconeCarrinho } from "@/components/ui/icone-carrinho";
import { TextoOnda } from "@/components/ui/texto-onda";

// Tela exibida enquanto o conteúdo protegido carrega.
export default function Carregando() {
  return (
    <div className="bg-background flex h-full flex-col items-center justify-center gap-6 px-4">
      <IconeCarrinho size={72} className="text-primary" />

      <h1 className="text-foreground text-2xl font-semibold tracking-tight">Lista de Compras</h1>

      <TextoOnda
        texto="Carregando"
        className="text-muted-foreground text-sm font-medium tracking-wide"
      />
    </div>
  );
}
