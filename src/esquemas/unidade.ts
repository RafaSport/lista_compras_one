import { z } from "zod";

export const unidadeSchema = z.enum(["L", "ml", "kg", "g", "un"], {
  error: "Unidade inválida.",
});

export const tipoMedidaSchema = z.enum(["volume", "peso", "unidade"], {
  error: "Tipo de medida inválido.",
});

export const unidadeBaseSchema = z.enum(["L", "kg", "un"], {
  error: "Unidade base inválida.",
});

// Correspondência entre tipo de medida e unidades aceitas (doc 03, seção 3).
const UNIDADES_POR_TIPO = {
  volume: ["L", "ml"],
  peso: ["kg", "g"],
  unidade: ["un"],
} as const;

export function unidadeCompativel(
  tipoMedida: keyof typeof UNIDADES_POR_TIPO,
  unidade: string,
): boolean {
  return (UNIDADES_POR_TIPO[tipoMedida] as readonly string[]).includes(unidade);
}

export function unidadeBaseDoTipo(
  tipoMedida: keyof typeof UNIDADES_POR_TIPO,
): "L" | "kg" | "un" {
  const mapa = { volume: "L", peso: "kg", unidade: "un" } as const;
  return mapa[tipoMedida];
}