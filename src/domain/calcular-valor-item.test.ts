import { describe, expect, it } from "vitest";

import { calcularValorItem } from "./calcular-valor-item";

describe("calcularValorItem", () => {
  it("multiplica quantidade por valor unitário", () => {
    expect(calcularValorItem(3, 250)).toBe(750);
  });

  it("trata quantidade fracionada", () => {
    expect(calcularValorItem(1.5, 1000)).toBe(1500);
  });

  it("arredonda para o centavo mais próximo", () => {
    expect(calcularValorItem(3, 333)).toBe(999);
    expect(calcularValorItem(1.333, 100)).toBe(133);
  });

  it("trata quantidade zero", () => {
    expect(calcularValorItem(0, 500)).toBe(0);
  });

  it("trata valor unitário zero", () => {
    expect(calcularValorItem(5, 0)).toBe(0);
  });
});
