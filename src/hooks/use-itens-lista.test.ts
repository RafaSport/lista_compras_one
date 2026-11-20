/** Testa leitura reativa e escrita de itens padrão da lista. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { abrirBanco, fecharBanco } from "../local-db/abrir-banco";
import * as repositorio from "../local-db/repositories/itens-lista";
import { criarProduto } from "../local-db/repositories/produtos";
import { criarTipoLista } from "../local-db/repositories/tipos-lista";
import { useItensLista } from "./use-itens-lista";

let usuarioId: string;
let banco: ReturnType<typeof abrirBanco>;

beforeEach(() => {
  usuarioId = crypto.randomUUID();
  banco = abrirBanco(usuarioId);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fecharBanco(usuarioId);
});

describe("useItensLista", () => {
  it("lista itens de produtos ativos e oculta os ligados a produtos inativos", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
    const produtoAtivo = await criarProduto(banco, { nome: "Arroz", tipoMedida: "peso" });
    const produtoInativo = await criarProduto(banco, { nome: "Feijão", tipoMedida: "peso" });
    await banco.produtos.update(produtoInativo.id, { ativo: false });
    const itemAtivo = await repositorio.criarItemLista(banco, {
      tipoListaId: tipo.id,
      produtoId: produtoAtivo.id,
      quantidadePadrao: 1,
      unidadePadrao: "kg",
    });
    await banco.itens_lista.add({
      ...itemAtivo,
      id: crypto.randomUUID(),
      produto_id: produtoInativo.id,
    });

    const { result } = renderHook(() => useItensLista(usuarioId, tipo.id));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.dados).toEqual([itemAtivo]));
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("retorna lista vazia quando o tipo não tem itens", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Higiene" });
    const { result } = renderHook(() => useItensLista(usuarioId, tipo.id));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
  });

  it("não lista itens quando o tipo de lista está inativo", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Higiene" });
    await banco.tipos_lista.update(tipo.id, { ativo: false });
    const { result } = renderHook(() => useItensLista(usuarioId, tipo.id));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
  });

  it("expõe a falha de leitura do repositório", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
    vi.spyOn(repositorio, "listarItensLista").mockRejectedValue(new Error("Falha de leitura"));
    const { result } = renderHook(() => useItensLista(usuarioId, tipo.id));
    await waitFor(() => expect(result.current.erro).toBe("Falha de leitura"));
  });

  it("cria item pelo repositório com tipo e produto recebidos", async () => {
    const tipo = await criarTipoLista(banco, { nome: "Alimentação" });
    const produto = await criarProduto(banco, { nome: "Arroz", tipoMedida: "peso" });
    const { result } = renderHook(() => useItensLista(usuarioId, tipo.id));
    let criado: Awaited<ReturnType<typeof repositorio.criarItemLista>> | undefined;
    await act(async () => {
      criado = await result.current.criar({
        tipoListaId: tipo.id,
        produtoId: produto.id,
        quantidadePadrao: 2,
        unidadePadrao: "kg",
      });
    });
    expect(criado).toMatchObject({
      tipo_lista_id: tipo.id,
      produto_id: produto.id,
      quantidade_padrao: 2,
    });
    await waitFor(() => expect(result.current.dados).toEqual([criado]));
  });
});
