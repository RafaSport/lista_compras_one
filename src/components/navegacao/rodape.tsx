// Rodapé global, presente em todas as páginas.
// O padding inferior extra evita que a barra fixa de navegação cubra o texto.
export function Rodape() {
  return (
    <footer className="text-muted-foreground px-4 pb-20 pt-6 text-center text-xs">
      <p>
        © {new Date().getFullYear()} — Feito com dedicação por{" "}
        <span className="text-foreground font-medium">Rafael Guedes</span>
      </p>
    </footer>
  );
}