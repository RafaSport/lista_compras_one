import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = process.env.CODIGO_CONVITE;

describe("conferirCodigoConvite", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CODIGO_CONVITE = "segredo-de-teste";
  });

  afterEach(() => {
    process.env.CODIGO_CONVITE = ORIGINAL;
  });

  it("aceita o código exato", async () => {
    const { conferirCodigoConvite } = await import("./codigo-convite");
    expect(conferirCodigoConvite("segredo-de-teste")).toBe(true);
  });

  it("recusa código diferente", async () => {
    const { conferirCodigoConvite } = await import("./codigo-convite");
    expect(conferirCodigoConvite("outro-codigo")).toBe(false);
  });

  it("recusa código vazio", async () => {
    const { conferirCodigoConvite } = await import("./codigo-convite");
    expect(conferirCodigoConvite("")).toBe(false);
  });

  it("recusa quando a variável não está configurada", async () => {
    delete process.env.CODIGO_CONVITE;
    const { conferirCodigoConvite } = await import("./codigo-convite");
    expect(conferirCodigoConvite("qualquer-coisa")).toBe(false);
  });
});