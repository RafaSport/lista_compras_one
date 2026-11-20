/**
 * Calcula o total da compra (RN04).
 *
 * Soma os valores dos itens comprados. Itens não comprados não entram.
 */
export function calcularTotalCompra(itens: { valorItem: number; comprado: boolean }[]): number {
  return itens.reduce((total, item) => (item.comprado ? total + item.valorItem : total), 0);
}
