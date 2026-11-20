import { converterParaUnidadeBase, type Unidade } from "./converter-unidade";

/**
 * Calcula o preço por unidade base (RN01).
 *
 * Retorna o valor em centavos por unidade base, arredondado com Math.round.
 * O cálculo interno usa precisão total; só o resultado é arredondado.
 *
 * Exemplo: galão de 5 L por R$ 9,00 → 900 ÷ (5 × 1) = 180 centavos por litro.
 */
export function calcularPrecoUnidadeBase(
  valorUnitario: number,
  conteudo: number,
  unidade: Unidade,
): number {
  const conteudoBase = converterParaUnidadeBase(conteudo, unidade);

  if (conteudoBase === 0) {
    throw new Error("O conteúdo da embalagem não pode ser zero.");
  }

  return Math.round(valorUnitario / conteudoBase);
}
