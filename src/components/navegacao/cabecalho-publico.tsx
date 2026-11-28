import { IconeCarrinho } from "@/components/ui/icone-carrinho";

type Props = {
  subtitulo: string;
};

// Cabeçalho das telas públicas: ícone e título na mesma linha, subtítulo curto
// abaixo. Compacto de propósito — o formulário precisa caber na viewport sem
// gerar rolagem em tela de celular.
export function CabecalhoPublico({ subtitulo }: Props) {
  return (
    <header className="flex shrink-0 flex-col items-center pt-3 pb-2 text-center">
      <div className="flex items-center gap-2">
        <IconeCarrinho size={24} className="text-primary" />
        <h1 className="text-primary text-lg font-semibold tracking-tight">Lista de Compras</h1>
      </div>
      <p className="text-muted-foreground mt-0.5 text-xs [@media(max-height:600px)]:hidden">
        {subtitulo}
      </p>
    </header>
  );
}