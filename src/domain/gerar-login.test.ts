import { describe, expect, it } from "vitest";

import { gerarLogin } from "./gerar-login";

describe("gerarLogin", () => {
  it("remove acentos de nomes e sobrenomes", () => {
    expect(gerarLogin("José", "Álvares")).toBe("jose.alvares");
  });

  it("remove espaços internos do sobrenome", () => {
    expect(gerarLogin("João", "dos Santos")).toBe("joao.dossantos");
  });

  it("remove espaços internos do nome", () => {
    expect(gerarLogin("Ana Maria", "Silva")).toBe("anamaria.silva");
  });

  it("remove hífens dos nomes", () => {
    expect(gerarLogin("Jean-Luc", "Picard")).toBe("jeanluc.picard");
  });

  it("mantém nomes já minúsculos e sem acentos", () => {
    expect(gerarLogin("rafael", "guedes")).toBe("rafael.guedes");
  });

  it("preserva números nas partes do login", () => {
    expect(gerarLogin("Rafael", "Guedes2")).toBe("rafael.guedes2");
  });
});
