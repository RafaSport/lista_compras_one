/** Testes do contrato de itens-lista. */

import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../esquema";
import { criarItemLista, atualizarItemLista, listarItensLista } from "./itens-lista";
import { criarProduto } from "./produtos";
import { criarTipoLista } from "./tipos-lista";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

describe("repositório de itens padrão", () => {
  it("cria e lista o item padrão usando os schemas e referências válidas", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
    const produto = await criarProduto(banco, { nome: "Leite", tipoMedida: "volume" });
    const item = await criarItemLista(banco, {
      tipoListaId: tipo.id,
      produtoId: produto.id,
      quantidadePadrao: 1,
      unidadePadrao: "L",
    });

    expect(await listarItensLista(banco, { tipoListaId: tipo.id })).toEqual([item]);
  });

  it("atualiza o item padrão e incrementa o controle de sincronização", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
    const produto = await criarProduto(banco, { nome: "Leite", tipoMedida: "volume" });
    const item = await criarItemLista(banco, {
      tipoListaId: tipo.id,
      produtoId: produto.id,
      quantidadePadrao: 1,
      unidadePadrao: "L",
    });

    const atualizado = await atualizarItemLista(banco, {
      id: item.id,
      dados: {
        tipoListaId: tipo.id,
        produtoId: produto.id,
        quantidadePadrao: 2,
        unidadePadrao: "L",
      },
    });

    expect(atualizado).toMatchObject({
      quantidade_padrao: 2,
      versao: 2,
      estado_sincronizacao: "pendente",
    });
  });
  it("rejeita unidade incompatível com o tipo de medida", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
    const produto = await criarProduto(banco, { nome: "Farinha", tipoMedida: "peso" });
    await expect(
      criarItemLista(banco, {
        tipoListaId: tipo.id,
        produtoId: produto.id,
        quantidadePadrao: 1,
        unidadePadrao: "L",
      }),
    ).rejects.toThrow("Unidade incompatível");
  });
});
