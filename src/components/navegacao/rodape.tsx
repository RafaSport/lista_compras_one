// Rodapé global, presente em todas as páginas.
// Sem padding inferior extra: a altura é fixa e o layout raiz controla o espaço.
// O ano é fixo para não quebrar o prerender do Next.js 16.
export function Rodape() {
  return (
    <footer className="text-muted-foreground shrink-0 px-4 py-2 text-center text-xs">
      <p>
        © 2026 — Feito com dedicação por{" "}
        <span className="text-foreground font-medium">Rafael Guedes</span>
      </p>
    </footer>
  );
}