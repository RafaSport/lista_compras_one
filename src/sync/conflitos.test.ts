/** Testes da resolução de conflito por data de atualização. */
import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../local-db/esquema";
import { aplicarSupermercadoRecebido } from "./conflitos";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

const id = "91e86fb5-bd93-47ed-89d1-67f4a4aaae8b";

describe("resolução de conflitos", () => {
  it("mantém o cadastro local quando sua atualização é mais recente", async () => {
    await banco.supermercados.put({
      id,
      nome: "Nome local novo",
      ativo: true,
      criado_em: "2026-01-01T00:00:00.000Z",
      atualizado_em: "2026-02-01T00:00:00.000Z",
      versao: 2,
      estado_sincronizacao: "pendente",
      excluido_em: null,
    });

    const resultado = await aplicarSupermercadoRecebido(banco, {
      id,
      nome: "Nome remoto antigo",
      ativo: true,
      criadoEm: "2026-01-01T00:00:00.000Z",
      atualizadoEm: "2026-01-15T00:00:00.000Z",
    });
    expect(resultado.nome).toBe("Nome local novo");
  });

  it("aplica o cadastro remoto quando sua atualização é mais recente", async () => {
    await banco.supermercados.put({
      id,
      nome: "Nome local antigo",
      ativo: true,
      criado_em: "2026-01-01T00:00:00.000Z",
      atualizado_em: "2026-01-15T00:00:00.000Z",
      versao: 1,
      estado_sincronizacao: "pendente",
      excluido_em: null,
    });

    const resultado = await aplicarSupermercadoRecebido(banco, {
      id,
      nome: "Nome remoto novo",
      ativo: true,
      criadoEm: "2026-01-01T00:00:00.000Z",
      atualizadoEm: "2026-02-01T00:00:00.000Z",
    });
    expect(resultado).toMatchObject({
      nome: "Nome remoto novo",
      estado_sincronizacao: "sincronizado",
      versao: 2,
    });
  });
});
