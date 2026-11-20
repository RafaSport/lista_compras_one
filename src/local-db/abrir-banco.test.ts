/** Testes do contrato de abrir-banco. */

import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vitest";

import { abrirBanco, fecharBanco } from "./abrir-banco";
import { BancoLocal } from "./esquema";

const usuarioId = "4e1f67d0-2895-4abd-8c08-45ca7faf6ca6";
const outroUsuarioId = "b183dd96-3a5e-4680-905a-afb08fd5eb8d";

afterEach(async () => {
  const banco = abrirBanco(usuarioId);
  banco.close();
  await banco.delete();
  await fecharBanco(usuarioId);
  await fecharBanco(outroUsuarioId);
});

describe("abrirBanco", () => {
  it("reutiliza a instância Dexie do mesmo usuário", () => {
    expect(abrirBanco(usuarioId)).toBe(abrirBanco(usuarioId));
  });

  it("isola os dados por usuário", () => {
    const outroId = "b183dd96-3a5e-4680-905a-afb08fd5eb8d";
    expect(abrirBanco(usuarioId).name).not.toBe(abrirBanco(outroId).name);
  });

  it("mantém os dados depois de fechar e reabrir o banco", async () => {
    const banco = abrirBanco(usuarioId);
    await banco.open();
    await banco.supermercados.add({
      id: "mercado-1",
      nome: "Mercado",
      ativo: true,
      criado_em: "2026-01-01T00:00:00.000Z",
      versao: 1,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-01T00:00:00.000Z",
      excluido_em: null,
    });
    banco.close();
    await fecharBanco(usuarioId);
    await fecharBanco(outroUsuarioId);

    const recarregado = new BancoLocal(`lista-de-compras-${usuarioId}`);
    await recarregado.open();
    expect(await recarregado.supermercados.get("mercado-1")).toMatchObject({ nome: "Mercado" });
    recarregado.close();
  });

  it("rejeita identificadores de usuário inválidos", () => {
    expect(() => abrirBanco("id-inválido")).toThrow();
  });
});
