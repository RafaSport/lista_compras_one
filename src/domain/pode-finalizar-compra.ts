/** Verifica a condição de finalização da compra conforme a RN11. */
export function podeFinalizarCompra(itens: { comprado: boolean }[]): boolean {
  return itens.length > 0 && itens.every((item) => item.comprado);
}
