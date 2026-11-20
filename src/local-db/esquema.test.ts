/** Testes do contrato de esquema.test. */

import "fake-indexeddb/auto";

import Dexie from "dexie";
import { describe, expect, it } from "vitest";

import { BancoLocal } from "./esquema";
import { ESQUEMA_INICIAL } from "./esquema";

describe("esquema inicial do Dexie", () => {
  it("declara a versão inicial e as tabelas previstas para o aparelho", () => {
    expect(Object.keys(ESQUEMA_INICIAL)).toEqual([
      "supermercados",
      "tipos_lista",
      "produtos",
      "itens_lista",
      "compras",
      "itens_compra",
      "resumo_precos",
      "fila_sincronizacao",
    ]);
  });

  it("mantém a versão 1 e abre a versão atual 2", () => {
    expect(new BancoLocal("teste-versao").verno).toBe(2);
    expect(ESQUEMA_INICIAL.compras).not.toContain("criada_em");
  });

  it("declara os índices compostos e únicos previstos no modelo", () => {
    expect(ESQUEMA_INICIAL.compras).toContain("[supermercado_id+tipo_lista_id]");
    expect(ESQUEMA_INICIAL.itens_compra).toContain("[produto_id+comprado_em]");
    expect(ESQUEMA_INICIAL.resumo_precos).toContain("[produto_id+supermercado_id]");
    expect(ESQUEMA_INICIAL.itens_lista).toContain("&[tipo_lista_id+produto_id]");
  });

  it("adiciona o índice ao atualizar banco existente sem reescrever compras", async () => {
    const nome = `teste-upgrade-${crypto.randomUUID()}`;
    const legado = new Dexie(nome);
    legado.version(1).stores(ESQUEMA_INICIAL);
    await legado.open();
    await legado.table("compras").put({ id: "compra-existente", criada_em: "2026-01-01" });
    legado.close();

    const atualizado = new BancoLocal(nome);
    await atualizado.open();

    expect(atualizado.compras.schema.indexes.map((indice) => indice.name)).toContain("criada_em");
    expect(await atualizado.compras.get("compra-existente")).toMatchObject({
      id: "compra-existente",
      criada_em: "2026-01-01",
    });

    atualizado.close();
    await atualizado.delete();
  });
});
