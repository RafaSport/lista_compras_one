import { Separador } from "@/components/ui/separador";

// Rodapé global com a assinatura do projeto.
// A linha divisória vem do componente padrão de UI.
export function Rodape() {
  return (
    <>
      <Separador />
      <footer className="bg-background px-4 py-3">
        <p className="text-muted-foreground text-center text-xs">
          © 2026 — Feito com dedicação por Rafael Guedes
        </p>
      </footer>
    </>
  );
}