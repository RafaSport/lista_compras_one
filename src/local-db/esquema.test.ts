/** Testes do contrato de esquema.test. */

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

  it("usa a versão inicial 1", () => {
    expect(new BancoLocal("teste-versao").verno).toBe(1);
  });

  it("declara os índices compostos e únicos previstos no modelo", () => {
    expect(ESQUEMA_INICIAL.compras).toContain("[supermercado_id+tipo_lista_id]");
    expect(ESQUEMA_INICIAL.itens_compra).toContain("[produto_id+comprado_em]");
    expect(ESQUEMA_INICIAL.resumo_precos).toContain("[produto_id+supermercado_id]");
    expect(ESQUEMA_INICIAL.itens_lista).toContain("&[tipo_lista_id+produto_id]");
  });
});
