/** Testes do contrato de itens-compra. */

import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../esquema";
import { criarCompra, fecharListaCompra } from "./compras";
import {
  atualizarItemCompra,
  comprarItem,
  desfazerCompraItem,
  excluirItemCompra,
} from "./itens-compra";
import { criarItemLista } from "./itens-lista";
import { criarProduto } from "./produtos";
import { criarSupermercado } from "./supermercados";
import { criarTipoLista } from "./tipos-lista";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

async function prepararItem(): Promise<{ compraId: string; itemId: string; padraoId: string }> {
  const supermercado = await criarSupermercado(banco, { nome: "Mercado" });
  const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
  const produto = await criarProduto(banco, { nome: "Arroz", tipoMedida: "peso" });
  const padrao = await criarItemLista(banco, {
    tipoListaId: tipo.id,
    produtoId: produto.id,
    quantidadePadrao: 2,
    unidadePadrao: "kg",
  });
  const compra = await criarCompra(banco, {
    supermercadoId: supermercado.id,
    tipoListaId: tipo.id,
  });
  const item = (await banco.itens_compra.where("compra_id").equals(compra.id).first())!;
  await fecharListaCompra(banco, { compraId: compra.id });
  return { compraId: compra.id, itemId: item.id, padraoId: padrao.id };
}

describe("repositório de itens_compra", () => {
  it("compra em centavos e atualiza apenas o item da compra", async () => {
    const { itemId, padraoId } = await prepararItem();
    const comprado = await comprarItem(banco, { itemId, valorUnitario: 450 });
    expect(comprado).toMatchObject({
      valor_item: 900,
      preco_unidade_base: 450,
      situacao: "comprado",
    });
    expect(await banco.itens_lista.get(padraoId)).toMatchObject({
      quantidade_padrao: 2,
      unidade_padrao: "kg",
    });
  });

  it("edita campos do item sem alterar o item padrão", async () => {
    const { itemId, padraoId } = await prepararItem();
    await atualizarItemCompra(banco, {
      id: itemId,
      dados: {
        quantidade: 3,
        unidade: "kg",
        conteudo: 1,
        embalagem: "pacote",
        marca: "Marca",
        observacao: "Integral",
      },
    });
    expect(await banco.itens_lista.get(padraoId)).toMatchObject({ quantidade_padrao: 2 });
    expect(await banco.itens_compra.get(itemId)).toMatchObject({
      quantidade: 3,
      embalagem: "pacote",
    });
  });

  it("desfaz uma compra mantendo o preço unitário digitado", async () => {
    const { itemId } = await prepararItem();
    await comprarItem(banco, { itemId, valorUnitario: 450 });
    expect(await desfazerCompraItem(banco, { itemId })).toMatchObject({
      situacao: "pendente",
      valor_unitario: 450,
      valor_item: null,
      preco_unidade_base: null,
    });
  });

  it("impede excluir item comprado sem desfazer antes", async () => {
    const { itemId } = await prepararItem();
    await comprarItem(banco, { itemId, valorUnitario: 450 });
    await expect(excluirItemCompra(banco, { itemId })).rejects.toThrow("Desfaça");
  });
});
