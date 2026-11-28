"use client";

import type { ReactNode } from "react";
import { cn } from "@/app/lib/utilitarios";

type Ordenacao = "alfabetica" | "data";

type Props<T> = {
  itens: T[];
  // Extrai o texto usado na ordenação alfabética.
  chaveTexto?: (item: T) => string;
  // Extrai a data usada na ordenação cronológica.
  chaveData?: (item: T) => Date | string;
  ordenacao?: Ordenacao;
  // Renderiza cada item. O <li> é criado aqui; devolva só o conteúdo.
  renderizarItem: (item: T, indice: number) => ReactNode;
  // Texto exibido quando a lista está vazia.
  vazio?: ReactNode;
  className?: string;
  classNameItem?: string;
};

// Comparador alfabético em pt-BR: ignora acentos e maiúsculas.
const colador = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });

function paraData(valor: Date | string): number {
  const data = valor instanceof Date ? valor : new Date(valor);
  const tempo = data.getTime();
  // Datas inválidas vão para o fim da lista.
  return Number.isNaN(tempo) ? -Infinity : tempo;
}

// Lista ordenada reutilizável.
// Alfabética: ignora acentos e maiúsculas (ex.: "Água" vem antes de "Arroz").
// Data: mais recente primeiro.
export function Lista<T>({
  itens,
  chaveTexto,
  chaveData,
  ordenacao = "alfabetica",
  renderizarItem,
  vazio,
  className,
  classNameItem,
}: Props<T>) {
  if (itens.length === 0) {
    return <>{vazio ?? null}</>;
  }

  const ordenados = [...itens].sort((a, b) => {
    if (ordenacao === "data") {
      if (!chaveData) return 0;
      return paraData(chaveData(b)) - paraData(chaveData(a));
    }

    if (!chaveTexto) return 0;
    return colador.compare(chaveTexto(a), chaveTexto(b));
  });

  return (
    <ul role="list" className={cn("flex flex-col gap-2", className)}>
      {ordenados.map((item, indice) => (
        <li key={indice} className={classNameItem}>
          {renderizarItem(item, indice)}
        </li>
      ))}
    </ul>
  );
}
