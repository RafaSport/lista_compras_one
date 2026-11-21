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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          {/* Coluna flexível para o rodapé ficar sempre no fim da página */}
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <Rodape />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}