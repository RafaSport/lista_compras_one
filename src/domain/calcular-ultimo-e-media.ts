/**
 * Item de histórico usado no cálculo de último valor e média (RN02).
 * Só entram itens comprados de compras finalizadas.
 */
export interface ItemHistorico {
  precoUnidadeBase: number;
  compradoEm: Date;
}

export interface UltimoEMedia {
  ultimoValor: number;
  valorMedio: number;
}

/** Calcula a média simples em centavos a partir da soma e da quantidade. */
export function calcularValorMedio(soma: number, quantidade: number): number | null {
  if (quantidade <= 0) return null;

  return Math.round(soma / quantidade);
}

/**
 * Calcula o último valor e o valor médio por produto + supermercado (RN02).
 *
 * ultimo_valor = preco_unidade_base do item com comprado_em mais recente
 * valor_medio  = soma dos preços ÷ quantidade de compras (média simples)
 *
 * Retorna null quando não há histórico.
 */
export function calcularUltimoEMedia(itens: ItemHistorico[]): UltimoEMedia | null {
  if (itens.length === 0) {
    return null;
  }

  const maisRecente = itens.reduce((atual, item) =>
    item.compradoEm.getTime() > atual.compradoEm.getTime() ? item : atual,
  );

  const soma = itens.reduce((total, item) => total + item.precoUnidadeBase, 0);

  const valorMedio = calcularValorMedio(soma, itens.length);
  if (valorMedio === null) return null;

  return { ultimoValor: maisRecente.precoUnidadeBase, valorMedio };
}
