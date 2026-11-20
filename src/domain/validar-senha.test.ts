import { describe, expect, it } from "vitest";

import { validarSenha } from "./validar-senha";

describe("validarSenha", () => {
  it("aceita senha com pelo menos oito caracteres, letra e número", () => {
    expect(validarSenha("abc12345")).toBe(true);
  });

  it("rejeita senha com menos de oito caracteres", () => {
    expect(validarSenha("abc1234")).toBe(false);
  });

  it("rejeita senha sem número", () => {
    expect(validarSenha("abcdefgh")).toBe(false);
  });

  it("rejeita senha sem letra", () => {
    expect(validarSenha("12345678")).toBe(false);
  });

  it("aceita maiúsculas sem exigir que elas estejam presentes", () => {
    expect(validarSenha("Abc12345")).toBe(true);
  });

  it("não proíbe espaços quando os demais requisitos são atendidos", () => {
    expect(validarSenha("abc 1234")).toBe(true);
  });

  it("rejeita uma string vazia", () => {
    expect(validarSenha("")).toBe(false);
  });
});
