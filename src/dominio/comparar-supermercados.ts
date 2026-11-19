/**
 * Supermercado com preço médio em centavos por unidade base (RN03).
 */
export interface PrecoSupermercado {
  supermercadoId: string;
  valorMedio: number;
}

/** Compara médias na mesma unidade base e mantém o primeiro supermercado em caso de empate (RN03). */
export function compararSupermercados(precos: PrecoSupermercado[]): PrecoSupermercado | null {
  if (precos.length === 0) {
    return null;
  }

  return precos.reduce((maisEmConta, atual) =>
    atual.valorMedio < maisEmConta.valorMedio ? atual : maisEmConta,
  );
}
