import { describe, expect, it } from "vitest";

import { compararSupermercados } from "./comparar-supermercados";

describe("compararSupermercados", () => {
  it("retorna null quando a lista está vazia", () => {
    expect(compararSupermercados([])).toBeNull();
  });

  it("retorna o único supermercado da lista", () => {
    const preco = { supermercadoId: "mercado-1", valorMedio: 180 };
    expect(compararSupermercados([preco])).toBe(preco);
  });

  it("escolhe o menor valor médio entre três supermercados", () => {
    const precos = [
      { supermercadoId: "mercado-1", valorMedio: 250 },
      { supermercadoId: "mercado-2", valorMedio: 180 },
      { supermercadoId: "mercado-3", valorMedio: 220 },
    ];

    expect(compararSupermercados(precos)).toBe(precos[1]);
  });

  it("mantém o primeiro supermercado quando há empate", () => {
    const primeiro = { supermercadoId: "mercado-1", valorMedio: 180 };
    const segundo = { supermercadoId: "mercado-2", valorMedio: 180 };

    expect(compararSupermercados([primeiro, segundo])).toBe(primeiro);
  });

  it("identifica 180 centavos por litro como menor que 200", () => {
    const precos = [
      { supermercadoId: "mercado-1", valorMedio: 200 },
      { supermercadoId: "mercado-2", valorMedio: 180 },
    ];

    expect(compararSupermercados(precos)).toBe(precos[1]);
  });
});
