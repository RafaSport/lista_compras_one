export { base, variantes, tamanhos };
export type { Variante, Tamanho };

type Variante = "primario" | "secundario" | "fantasma" | "perigo";
type Tamanho = "sm" | "md" | "lg";

// Estilos base compartilhados por todas as variações
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const variantes: Record<Variante, string> = {
  primario: "bg-primary text-primary-foreground hover:bg-primary/90",
  secundario: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  fantasma: "bg-transparent text-foreground hover:bg-accent",
  perigo: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};
