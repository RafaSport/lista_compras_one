import { describe, expect, it } from "vitest";

import { calcularTotalCompra } from "./calcular-total-compra";

describe("calcularTotalCompra", () => {
  it("soma os itens comprados", () => {
    const itens = [
      { valorItem: 750, comprado: true },
      { valorItem: 1200, comprado: true },
    ];
    expect(calcularTotalCompra(itens)).toBe(1950);
  });

  it("ignora itens não comprados", () => {
    const itens = [
      { valorItem: 750, comprado: true },
      { valorItem: 1200, comprado: false },
    ];
    expect(calcularTotalCompra(itens)).toBe(750);
  });

  it("retorna zero quando nenhum item foi comprado", () => {
    const itens = [
      { valorItem: 750, comprado: false },
      { valorItem: 1200, comprado: false },
    ];
    expect(calcularTotalCompra(itens)).toBe(0);
  });

  it("retorna zero para lista vazia", () => {
    expect(calcularTotalCompra([])).toBe(0);
  });
});
