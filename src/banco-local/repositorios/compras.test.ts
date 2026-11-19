/** Testes do repositório de compras e seus efeitos de finalização. */
import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../esquema";
import { criarCompra, excluirCompra, fecharListaCompra, finalizarCompra } from "./compras";
import { comprarItem } from "./itens-compra";
import { criarItemLista } from "./itens-lista";
import { criarProduto } from "./produtos";
import { criarSupermercado } from "./supermercados";
import { criarTipoLista } from "./tipos-lista";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal(`teste-${crypto.randomUUID()}`);
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

async function prepararCompra(): Promise<string> {
  const supermercado = await criarSupermercado(banco, { nome: "Mercado" });
  const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
  const produto = await criarProduto(banco, { nome: "Leite", tipoMedida: "volume" });
  await criarItemLista(banco, {
    tipoListaId: tipo.id,
    produtoId: produto.id,
    quantidadePadrao: 1,
    unidadePadrao: "L",
  });
  return (await criarCompra(banco, { supermercadoId: supermercado.id, tipoListaId: tipo.id })).id;
}

describe("repositório de compras", () => {
  it("cria compra offline copiando itens padrão para itens_compra", async () => {
    const id = await prepararCompra();
    expect(await banco.compras.get(id)).toMatchObject({ situacao: "em_montagem" });
    expect(await banco.itens_compra.where("compra_id").equals(id).count()).toBe(1);
  });

  it("fecha uma compra em montagem", async () => {
    const id = await prepararCompra();
    expect(await fecharListaCompra(banco, { compraId: id })).toMatchObject({
      situacao: "em_aberto",
      fechada_em: expect.any(String),
    });
  });

  it("recusa finalizar quando existe item pendente", async () => {
    const id = await prepararCompra();
    await fecharListaCompra(banco, { compraId: id });
    await expect(finalizarCompra(banco, { compraId: id })).rejects.toThrow(
      "todos devem estar comprados",
    );
  });

  it("remove do resumo os preços de compra finalizada não enviada quando ela é excluída", async () => {
    const id = await prepararCompra();
    await fecharListaCompra(banco, { compraId: id });
    const item = (await banco.itens_compra.where("compra_id").equals(id).first())!;
    await comprarItem(banco, { itemId: item.id, valorUnitario: 900 });
    const compra = await finalizarCompra(banco, { compraId: id });

    await excluirCompra(banco, { compraId: id });

    expect(await banco.compras.get(id)).toBeUndefined();
    expect(
      await banco.resumo_precos.get([item.produto_id, compra.supermercado_id]),
    ).toBeUndefined();
  });
  it("grava total, resumo e fila ao finalizar, sem duplicar a fila", async () => {
    const id = await prepararCompra();
    await fecharListaCompra(banco, { compraId: id });
    const item = (await banco.itens_compra.where("compra_id").equals(id).first())!;
    await comprarItem(banco, { itemId: item.id, valorUnitario: 900 });

    const finalizada = await finalizarCompra(banco, { compraId: id });

    expect(finalizada).toMatchObject({ situacao: "finalizada", valor_total: 900 });
    expect(await banco.fila_sincronizacao.where("compra_id").equals(id).count()).toBe(1);
    expect(
      await banco.resumo_precos.get([item.produto_id, finalizada.supermercado_id]),
    ).toMatchObject({
      ultimo_valor: 900,
      soma_precos: 900,
      quantidade_compras: 1,
    });
    await finalizarCompra(banco, { compraId: id });
    expect(await banco.fila_sincronizacao.where("compra_id").equals(id).count()).toBe(1);
  });
});
