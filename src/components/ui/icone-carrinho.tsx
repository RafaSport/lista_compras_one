import type { SVGProps } from "react";

// Carrinho de compras em SVG inline.
// Usa currentColor, então herda a cor do texto onde for colocado.
export function IconeCarrinho(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Corpo do carrinho */}
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" />
      {/* Rodas */}
      <circle cx="10" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </svg>
  );
}