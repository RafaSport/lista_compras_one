import type { ReactNode } from "react";

export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Lista de Compras
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Compare preços por litro, quilo e unidade.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
