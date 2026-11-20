/** Testes do contrato de tipos-lista. */

import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../esquema";
import { criarTipoLista, excluirTipoLista, listarTiposLista } from "./tipos-lista";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

describe("repositório de tipos de lista", () => {
  it("cria e lista um tipo validado", async () => {
    const criado = await criarTipoLista(banco, { nome: "Alimentação" });
    expect(criado.estado_sincronizacao).toBe("pendente");
    expect(await listarTiposLista(banco)).toEqual([criado]);
  });

  it("mantém tipo ativo na listagem mesmo com carimbo de sincronização", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Higiene" });
    const atualizado = { ...tipo, excluido_em: "2026-01-02T00:00:00.000Z" };
    await banco.tipos_lista.put(atualizado);

    expect(await listarTiposLista(banco)).toEqual([atualizado]);
  });

  it("desativa um tipo vinculado a uma compra", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
    await banco.compras.add({
      id: "compra-1",
      supermercado_id: "mercado-1",
      tipo_lista_id: tipo.id,
      situacao: "em_aberto",
      valor_total: null,
      criada_em: "2026-01-01T00:00:00.000Z",
      fechada_em: null,
      finalizada_em: null,
      salva_em: null,
      versao: 1,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-01T00:00:00.000Z",
      excluido_em: null,
    });
    await excluirTipoLista(banco, { id: tipo.id });
    expect(await banco.tipos_lista.get(tipo.id)).toMatchObject({
      ativo: false,
      excluido_em: expect.any(String),
    });
  });

  it("remove tipo e itens padrão quando não há compras", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Temporário" });
    await excluirTipoLista(banco, { id: tipo.id });
    expect(await banco.tipos_lista.get(tipo.id)).toBeUndefined();
  });
});
