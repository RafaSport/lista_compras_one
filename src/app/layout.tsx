import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Rodape } from "@/components/navegacao/rodape";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lista de Compras",
  description: "Listas de compras por tipo, com preço por unidade base.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

// Layout raiz. Trava a altura na viewport (h-dvh) e esconde o overflow,
// para nenhuma tela gerar barra de rolagem. O conteúdo interno usa flex
// e rola apenas dentro da própria área quando for inevitável.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full overflow-hidden">
      <body className={`${inter.className} h-full overflow-hidden`}>
        <SessionProvider>
          <div className="flex h-full flex-col overflow-hidden">
            {/* Área de conteúdo. min-h-0 permite que o filho encolha e não estoure. */}
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
            <Rodape />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}