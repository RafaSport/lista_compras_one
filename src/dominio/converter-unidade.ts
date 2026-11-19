/**
 * Fatores de conversão para a unidade base de cada tipo de medida.
 * L, kg e un são a base (fator 1). ml e g são milésimos.
 */
const FATORES = {
  L: 1,
  ml: 0.001,
  kg: 1,
  g: 0.001,
  un: 1,
} as const;

export type Unidade = keyof typeof FATORES;

/**
 * Converte um conteúdo informado na unidade escolhida para a unidade base
 * correspondente (L, kg ou un).
 *
 * Exemplo: 500 ml → 0.5 L. 250 g → 0.25 kg.
 */
export function converterParaUnidadeBase(conteudo: number, unidade: Unidade): number {
  return conteudo * FATORES[unidade];
}
