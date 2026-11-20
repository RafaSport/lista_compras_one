/** Testa leitura reativa e escrita dos itens de uma compra. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { abrirBanco, fecharBanco } from "../local-db/abrir-banco";
import * as repositorio from "../local-db/repositories/itens-compra";
import { criarCompra } from "../local-db/repositories/compras";
import { criarProduto } from "../local-db/repositories/produtos";
import { criarSupermercado } from "../local-db/repositories/supermercados";
import { criarTipoLista } from "../local-db/repositories/tipos-lista";
import { useItensCompra } from "./use-itens-compra";

let usuarioId: string;
let banco: ReturnType<typeof abrirBanco>;
let compraId: string;
let produtoId: string;

beforeEach(async () => {
  usuarioId = crypto.randomUUID();
  banco = abrirBanco(usuarioId);
  const supermercado = await criarSupermercado(banco, { nome: "Mercado" });
  const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
  produtoId = (await criarProduto(banco, { nome: "Arroz", tipoMedida: "peso" })).id;
  compraId = (await criarCompra(banco, { supermercadoId: supermercado.id, tipoListaId: tipo.id }))
    .id;
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fecharBanco(usuarioId);
});

describe("useItensCompra", () => {
  it("retorna apenas itens da compra solicitada", async () => {
    const outroProduto = await criarProduto(banco, { nome: "Feijão", tipoMedida: "peso" });
    const itemDaCompra = await repositorio.adicionarItemCompra(banco, {
      compraId,
      produtoId,
      quantidade: 1,
      unidade: "kg",
      conteudo: 1,
    });
    const outraCompra = await criarCompra(banco, {
      supermercadoId: (await banco.supermercados.toArray())[0]!.id,
      tipoListaId: (await banco.tipos_lista.toArray())[0]!.id,
    });
    await repositorio.adicionarItemCompra(banco, {
      compraId: outraCompra.id,
      produtoId: outroProduto.id,
      quantidade: 1,
      unidade: "kg",
      conteudo: 1,
    });

    const { result } = renderHook(() => useItensCompra(usuarioId, compraId));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.dados).toEqual([itemDaCompra]));
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("retorna lista vazia quando a compra não tem itens", async () => {
    const { result } = renderHook(() => useItensCompra(usuarioId, compraId));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
  });

  it("expõe a falha de leitura do repositório", async () => {
    vi.spyOn(repositorio, "listarItensCompra").mockRejectedValue(new Error("Falha de leitura"));
    const { result } = renderHook(() => useItensCompra(usuarioId, compraId));
    await waitFor(() => expect(result.current.erro).toBe("Falha de leitura"));
  });

  it("adiciona item pelo repositório com compra e produto recebidos", async () => {
    const { result } = renderHook(() => useItensCompra(usuarioId, compraId));
    let criado: Awaited<ReturnType<typeof repositorio.adicionarItemCompra>> | undefined;
    await act(async () => {
      criado = await result.current.adicionar({
        compraId,
        produtoId,
        quantidade: 2,
        unidade: "kg",
        conteudo: 1,
      });
    });
    expect(criado).toMatchObject({ compra_id: compraId, produto_id: produtoId, quantidade: 2 });
    await waitFor(() => expect(result.current.dados).toEqual([criado]));
  });
});
