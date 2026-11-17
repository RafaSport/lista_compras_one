"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  erro?: string;
  dica?: string;
};

export const Campo = forwardRef<HTMLInputElement, Props>(function Campo(
  { rotulo, erro, dica, id, className, ...resto },
  ref,
) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = `${idCampo}-erro`;
  const idDica = `${idCampo}-dica`;

  const descritoPor = [erro ? idErro : null, dica ? idDica : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={idCampo}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {rotulo}
      </label>

      <input
        ref={ref}
        id={idCampo}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor || undefined}
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
          "bg-white text-slate-900 placeholder:text-slate-400",
          "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
          "focus:ring-2 focus:ring-offset-0",
          erro
            ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900"
            : "border-slate-300 focus:border-slate-500 focus:ring-slate-200 dark:border-slate-700 dark:focus:border-slate-500 dark:focus:ring-slate-800",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...resto}
      />

      {dica && !erro && (
        <p id={idDica} className="text-xs text-slate-500 dark:text-slate-400">
          {dica}
        </p>
      )}

      {erro && (
        <p id={idErro} role="alert" className="text-xs text-red-600 dark:text-red-400">
          {erro}
        </p>
      )}
    </div>
  );
});