/** Testes do contrato de controle. */

import { describe, expect, it } from "vitest";

import {
  atualizarControleSincronizacao,
  novoControleSincronizacao,
  registrarExclusaoSincronizacao,
} from "./controle";

describe("controle de sincronização", () => {
  it("inicia novos registros na primeira versão e pendentes", () => {
    expect(novoControleSincronizacao("2026-01-01T00:00:00.000Z")).toEqual({
      versao: 1,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-01T00:00:00.000Z",
      excluido_em: null,
    });
  });

  it("incrementa a versão e atualiza a data ao gravar novamente", () => {
    const controle = novoControleSincronizacao("2026-01-01T00:00:00.000Z");
    expect(atualizarControleSincronizacao(controle, "2026-01-02T00:00:00.000Z")).toEqual({
      versao: 2,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-02T00:00:00.000Z",
    });
  });

  it("registra a exclusão lógica como metadado pendente de sincronização", () => {
    const controle = novoControleSincronizacao("2026-01-01T00:00:00.000Z");

    expect(registrarExclusaoSincronizacao(controle, "2026-01-02T00:00:00.000Z")).toEqual({
      versao: 2,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-02T00:00:00.000Z",
      excluido_em: "2026-01-02T00:00:00.000Z",
    });
  });
});
