/** Testes do contrato de produtos. */

import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../esquema";
import { criarProduto, excluirProduto, listarProdutos } from "./produtos";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

describe("repositório de produtos", () => {
  it("cria um produto com tipo de medida validado", async () => {
    const produto = await criarProduto(banco, { nome: "Arroz", tipoMedida: "peso" });
    expect(produto).toMatchObject({ nome: "Arroz", tipo_medida: "peso", ativo: true });
    expect(await listarProdutos(banco)).toEqual([produto]);
  });

  it("desativa o produto com itens de compra e conserva o histórico", async () => {
    const produto = await criarProduto(banco, { nome: "Arroz", tipoMedida: "peso" });
    await banco.itens_compra.add({
      id: "item-1",
      compra_id: "compra-1",
      produto_id: produto.id,
      situacao: "comprado",
      quantidade: 1,
      conteudo: 1,
      unidade: "kg",
      valor_unitario: 500,
      valor_item: 500,
      unidade_base: "kg",
      preco_unidade_base: 500,
      comprado_em: "2026-01-02T00:00:00.000Z",
      criado_em: "2026-01-01T00:00:00.000Z",
      versao: 1,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-02T00:00:00.000Z",
      excluido_em: null,
    });
    await excluirProduto(banco, { id: produto.id });
    expect(await banco.produtos.get(produto.id)).toMatchObject({ ativo: false });
    expect(await banco.itens_compra.get("item-1")).toBeDefined();
  });
});
