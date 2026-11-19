import { describe, expect, it } from "vitest";

import { podeFinalizarCompra } from "./pode-finalizar-compra";

describe("podeFinalizarCompra", () => {
  it("retorna false quando a lista está vazia", () => {
    expect(podeFinalizarCompra([])).toBe(false);
  });

  it("retorna true quando todos os itens foram comprados", () => {
    expect(podeFinalizarCompra([{ comprado: true }, { comprado: true }])).toBe(true);
  });

  it("retorna false quando há um item não comprado", () => {
    expect(podeFinalizarCompra([{ comprado: true }, { comprado: false }])).toBe(false);
  });

  it("permite finalizar com um único item comprado", () => {
    expect(podeFinalizarCompra([{ comprado: true }])).toBe(true);
  });

  it("não permite finalizar com um único item não comprado", () => {
    expect(podeFinalizarCompra([{ comprado: false }])).toBe(false);
  });
});
