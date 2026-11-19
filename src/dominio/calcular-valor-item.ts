/**
 * Calcula o valor do item (RN04).
 *
 * valor_item = quantidade × valor_unitario, arredondado para centavos.
 */
export function calcularValorItem(quantidade: number, valorUnitario: number): number {
  return Math.round(quantidade * valorUnitario);
}
