/** Testes do contrato de resumo-precos. */

import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BancoLocal } from "../esquema";
import {
  listarResumoPrecos,
  obterSupermercadoMaisEmConta,
  reconstruirResumoPreco,
} from "./resumo-precos";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
});

describe("repositório de resumo_precos", () => {
  it("reconstrói média, soma e último valor só com compras finalizadas", async () => {
    await banco.produtos.add({
      id: "produto-1",
      nome: "Leite",
      tipo_medida: "volume",
      ativo: true,
      criado_em: "2026-01-01T00:00:00.000Z",
      versao: 1,
      estado_sincronizacao: "pendente",
      atualizado_em: "2026-01-01T00:00:00.000Z",
      excluido_em: null,
    });
    await banco.compras.bulkAdd([
      {
        id: "compra-1",
        supermercado_id: "mercado-1",
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
      },
      {
        id: "compra-2",
        supermercado_id: "mercado-1",
        tipo_lista_id: "tipo-1",
        situacao: "em_aberto",
        valor_total: null,
        criada_em: "2026-01-03T00:00:00.000Z",
        fechada_em: null,
        finalizada_em: null,
        salva_em: null,
        versao: 1,
        estado_sincronizacao: "pendente",
        atualizado_em: "2026-01-03T00:00:00.000Z",
        excluido_em: null,
      },
    ]);
    await banco.itens_compra.bulkAdd([
      {
        id: "item-1",
        compra_id: "compra-1",
        produto_id: "produto-1",
        situacao: "comprado",
        quantidade: 1,
        conteudo: 5,
        unidade: "L",
        valor_unitario: 900,
        valor_item: 900,
        unidade_base: "L",
        preco_unidade_base: 180,
        comprado_em: "2026-01-02T00:00:00.000Z",
        criado_em: "2026-01-01T00:00:00.000Z",
        versao: 1,
        estado_sincronizacao: "pendente",
        atualizado_em: "2026-01-02T00:00:00.000Z",
        excluido_em: null,
      },
      {
        id: "item-2",
        compra_id: "compra-2",
        produto_id: "produto-1",
        situacao: "comprado",
        quantidade: 1,
        conteudo: 5,
        unidade: "L",
        valor_unitario: 1000,
        valor_item: 1000,
        unidade_base: "L",
        preco_unidade_base: 200,
        comprado_em: "2026-01-04T00:00:00.000Z",
        criado_em: "2026-01-03T00:00:00.000Z",
        versao: 1,
        estado_sincronizacao: "pendente",
        atualizado_em: "2026-01-04T00:00:00.000Z",
        excluido_em: null,
      },
    ]);

    const resumo = await reconstruirResumoPreco(banco, {
      produtoId: "produto-1",
      supermercadoId: "mercado-1",
    });
    expect(resumo).toMatchObject({
      unidade_base: "L",
      ultimo_valor: 180,
      soma_precos: 180,
      quantidade_compras: 1,
    });
    await expect(listarResumoPrecos(banco, { produtoId: "produto-1" })).resolves.toMatchObject([
      { ultimo_valor: 180, valor_medio: 180 },
    ]);
  });

  it("escolhe o menor preço médio entre supermercados", async () => {
    const agora = "2026-01-01T00:00:00.000Z";
    await banco.produtos.put({
      id: "produto-1",
      nome: "Leite",
      tipo_medida: "volume",
      ativo: true,
      criado_em: agora,
      versao: 1,
      estado_sincronizacao: "pendente",
      atualizado_em: agora,
      excluido_em: null,
    });
    const compras = [
      { id: "compra-1", supermercadoId: "mercado-1", itemId: "item-1", preco: 200, dia: "02" },
      { id: "compra-2", supermercadoId: "mercado-2", itemId: "item-2", preco: 180, dia: "03" },
    ];
    for (const compra of compras) {
      await banco.compras.put({
        id: compra.id,
        supermercado_id: compra.supermercadoId,
        tipo_lista_id: "tipo-1",
        situacao: "finalizada",
        valor_total: compra.preco,
        criada_em: agora,
        fechada_em: agora,
        finalizada_em: agora,
        salva_em: null,
        versao: 1,
        estado_sincronizacao: "pendente",
        atualizado_em: agora,
        excluido_em: null,
      });
      await banco.itens_compra.put({
        id: compra.itemId,
        compra_id: compra.id,
        produto_id: "produto-1",
        situacao: "comprado",
        quantidade: 1,
        conteudo: 1,
        unidade: "L",
        valor_unitario: compra.preco,
        valor_item: compra.preco,
        unidade_base: "L",
        preco_unidade_base: compra.preco,
        comprado_em: `2026-01-${compra.dia}T00:00:00.000Z`,
        criado_em: agora,
        versao: 1,
        estado_sincronizacao: "pendente",
        atualizado_em: agora,
        excluido_em: null,
      });
      await reconstruirResumoPreco(banco, {
        produtoId: "produto-1",
        supermercadoId: compra.supermercadoId,
      });
    }

    expect(
      await obterSupermercadoMaisEmConta(banco, { produtoId: "produto-1", unidadeBase: "L" }),
    ).toMatchObject({ supermercado_id: "mercado-2", ultimo_valor: 180, valor_medio: 180 });
  });
});
