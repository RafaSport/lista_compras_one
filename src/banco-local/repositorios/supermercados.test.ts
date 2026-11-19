/** Testes do contrato de supermercados. */

import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../esquema";
import { criarSupermercado, excluirSupermercado, listarSupermercados } from "./supermercados";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

describe("repositório de supermercados", () => {
  it("cria e lista um supermercado validado", async () => {
    const criado = await criarSupermercado(banco, { nome: "Mercado Central" });
    expect(criado.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(await listarSupermercados(banco)).toEqual([criado]);
  });

  it("desativa o supermercado com histórico sem apagar a referência", async () => {
    const supermercado = await criarSupermercado(banco, { nome: "Mercado Central" });
    await banco.compras.add({
      id: "compra-1",
      supermercado_id: supermercado.id,
      tipo_lista_id: "tipo-1",
      situacao: "finalizada",
      valor_total: 900,
      criada_em: "2026-01-01T00:00:00.000Z",
      fechada_em: null,
      finalizada_em: "2026-01-02T00:00:00.000Z",
      salva_em: null,
      versao: 1,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-02T00:00:00.000Z",
      excluido_em: null,
    });

    await excluirSupermercado(banco, { id: supermercado.id });

    expect(await banco.supermercados.get(supermercado.id)).toMatchObject({
      ativo: false,
      excluido_em: expect.any(String),
    });
    expect(await banco.compras.get("compra-1")).toBeDefined();
    expect(await listarSupermercados(banco)).toEqual([]);
  });

  it("remove de verdade o supermercado sem compras", async () => {
    const criado = await criarSupermercado(banco, { nome: "Temporário" });
    await excluirSupermercado(banco, { id: criado.id });
    expect(await banco.supermercados.get(criado.id)).toBeUndefined();
  });
});
