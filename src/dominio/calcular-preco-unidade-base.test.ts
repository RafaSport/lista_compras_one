import { describe, expect, it } from "vitest";

import { calcularPrecoUnidadeBase } from "./calcular-preco-unidade-base";

describe("calcularPrecoUnidadeBase", () => {
  it("calcula o preço por litro de um galão de 5 L por R$ 9,00", () => {
    expect(calcularPrecoUnidadeBase(900, 5, "L")).toBe(180);
  });

  it("calcula o preço por litro de um frasco de 2 L por R$ 4,00", () => {
    expect(calcularPrecoUnidadeBase(400, 2, "L")).toBe(200);
  });

  it("calcula o preço por litro de um frasco de 500 ml por R$ 3,00", () => {
    expect(calcularPrecoUnidadeBase(300, 500, "ml")).toBe(600);
  });

  it("500 ml e 0,5 L produzem o mesmo preço por litro", () => {
    const comMililitros = calcularPrecoUnidadeBase(300, 500, "ml");
    const comLitros = calcularPrecoUnidadeBase(300, 0.5, "L");
    expect(comMililitros).toBe(comLitros);
  });

  it("calcula o preço por quilo", () => {
    expect(calcularPrecoUnidadeBase(1200, 2, "kg")).toBe(600);
    expect(calcularPrecoUnidadeBase(1200, 2000, "g")).toBe(600);
  });

  it("calcula o preço por unidade", () => {
    expect(calcularPrecoUnidadeBase(450, 3, "un")).toBe(150);
  });

  it("arredonda para o centavo mais próximo", () => {
    expect(calcularPrecoUnidadeBase(1000, 3, "L")).toBe(333);
  });

  it("lança erro quando o conteúdo é zero", () => {
    expect(() => calcularPrecoUnidadeBase(900, 0, "L")).toThrow(
      "O conteúdo da embalagem não pode ser zero.",
    );
  });
});
