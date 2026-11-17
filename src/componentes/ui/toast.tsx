"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Variante = "sucesso" | "erro" | "aviso" | "info";

type Aviso = {
  id: number;
  variante: Variante;
  mensagem: string;
};

type ContextoToast = {
  mostrar: (mensagem: string, variante?: Variante) => void;
};

const Contexto = createContext<ContextoToast | null>(null);

const estilos: Record<Variante, string> = {
  sucesso: "border-success/40 bg-success/15 text-success",
  erro: "border-destructive/40 bg-destructive/15 text-destructive",
  aviso: "border-warning/40 bg-warning/15 text-warning",
  info: "border-info/40 bg-info/15 text-info",
};

const icones: Record<Variante, string> = {
  sucesso: "✓",
  erro: "!",
  aviso: "!",
  info: "i",
};

const DURACAO_MS = 4000;

// Provedor que guarda a fila de avisos e renderiza a pilha no canto da tela.
// Deve envolver a aplicação uma única vez, no layout raiz.
export function ProvedorToast({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const remover = useCallback((id: number) => {
    setAvisos((atual) => atual.filter((a) => a.id !== id));
  }, []);

  const mostrar = useCallback((mensagem: string, variante: Variante = "info") => {
    const id = Date.now() + Math.random();
    setAvisos((atual) => [...atual, { id, variante, mensagem }]);
  }, []);

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <Contexto.Provider value={valor}>
      {children}

      {/* aria-live="polite" faz o leitor de tela anunciar sem interromper */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {avisos.map((aviso) => (
          <ItemToast key={aviso.id} aviso={aviso} aoFechar={remover} />
        ))}
      </div>
    </Contexto.Provider>
  );
}

// Cada aviso se remove sozinho depois de alguns segundos
function ItemToast({
  aviso,
  aoFechar,
}: {
  aviso: Aviso;
  aoFechar: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => aoFechar(aviso.id), DURACAO_MS);
    return () => clearTimeout(timer);
  }, [aviso.id, aoFechar]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur",
        estilos[aviso.variante],
      )}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold"
      >
        {icones[aviso.variante]}
      </span>

      <span className="flex-1">{aviso.mensagem}</span>

      <button
        type="button"
        onClick={() => aoFechar(aviso.id)}
        aria-label="Fechar aviso"
        className="shrink-0 rounded-sm px-1 text-current opacity-60 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

// Hook usado pelos componentes e páginas para disparar um aviso
export function useToast() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useToast precisa estar dentro de ProvedorToast");
  }
  return contexto;
}