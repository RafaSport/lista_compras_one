import { Separador } from "@/components/ui/separador";

// Rodapé global com a assinatura do projeto.
// shrink-0 impede que o rodapé encolha ou empurre o conteúdo em telas pequenas.
export function Rodape() {
  return (
    <div className="shrink-0">
      <Separador />
      <footer className="bg-background px-4 py-3">
        <p className="text-muted-foreground text-center text-xs">
          © 2026 — Feito com dedicação por Rafael Guedes
        </p>
      </footer>
    </div>
  );
}
