import { describe, expect, it } from "vitest";

import { converterParaUnidadeBase } from "./converter-unidade";

describe("converterParaUnidadeBase", () => {
  it("mantém o valor quando a unidade já é a base", () => {
    expect(converterParaUnidadeBase(5, "L")).toBe(5);
    expect(converterParaUnidadeBase(2, "kg")).toBe(2);
    expect(converterParaUnidadeBase(12, "un")).toBe(12);
  });

  it("converte mililitros para litros", () => {
    expect(converterParaUnidadeBase(500, "ml")).toBe(0.5);
    expect(converterParaUnidadeBase(1500, "ml")).toBe(1.5);
  });

  it("converte gramas para quilos", () => {
    expect(converterParaUnidadeBase(250, "g")).toBe(0.25);
    expect(converterParaUnidadeBase(1000, "g")).toBe(1);
  });

  it("trata conteúdo zero", () => {
    expect(converterParaUnidadeBase(0, "ml")).toBe(0);
  });
});
