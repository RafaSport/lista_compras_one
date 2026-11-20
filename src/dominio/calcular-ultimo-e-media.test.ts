import { describe, expect, it } from "vitest";

import { calcularUltimoEMedia, calcularValorMedio } from "./calcular-ultimo-e-media";

describe("calcularValorMedio", () => {
  it("retorna null quando não há valores", () => {
    expect(calcularValorMedio(0, 0)).toBeNull();
  });

  it("arredonda a média para centavos inteiros", () => {
    expect(calcularValorMedio(301, 2)).toBe(151);
  });
});

describe("calcularUltimoEMedia", () => {
  it("retorna null quando não há histórico", () => {
    expect(calcularUltimoEMedia([])).toBeNull();
  });

  it("usa o preço do item mais recente como último valor", () => {
    const itens = [
      { precoUnidadeBase: 180, compradoEm: new Date("2026-01-10") },
      { precoUnidadeBase: 200, compradoEm: new Date("2026-03-15") },
      { precoUnidadeBase: 190, compradoEm: new Date("2026-02-20") },
    ];
    expect(calcularUltimoEMedia(itens)?.ultimoValor).toBe(200);
  });

  it("calcula a média simples dos preços", () => {
    const itens = [
      { precoUnidadeBase: 180, compradoEm: new Date("2026-01-10") },
      { precoUnidadeBase: 200, compradoEm: new Date("2026-03-15") },
      { precoUnidadeBase: 190, compradoEm: new Date("2026-02-20") },
    ];
    expect(calcularUltimoEMedia(itens)?.valorMedio).toBe(190);
  });

  it("arredonda a média para o centavo mais próximo", () => {
    const itens = [
      { precoUnidadeBase: 100, compradoEm: new Date("2026-01-10") },
      { precoUnidadeBase: 101, compradoEm: new Date("2026-01-11") },
      { precoUnidadeBase: 101, compradoEm: new Date("2026-01-12") },
    ];
    expect(calcularUltimoEMedia(itens)?.valorMedio).toBe(101);
  });

  it("funciona com um único item", () => {
    const itens = [{ precoUnidadeBase: 250, compradoEm: new Date("2026-05-01") }];
    expect(calcularUltimoEMedia(itens)).toEqual({ ultimoValor: 250, valorMedio: 250 });
  });
});
