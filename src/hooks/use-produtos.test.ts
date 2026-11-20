/** Testa leitura reativa, falhas e escrita de produtos. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { abrirBanco, fecharBanco } from "../local-db/abrir-banco";
import * as repositorio from "../local-db/repositories/produtos";
import { useProdutos } from "./use-produtos";

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

describe("useProdutos", () => {
  it("retorna produtos ativos e atualiza o estado de carregamento", async () => {
    const ativo = await repositorio.criarProduto(banco, { nome: "Arroz", tipoMedida: "peso" });
    const inativo = await repositorio.criarProduto(banco, { nome: "Feijão", tipoMedida: "peso" });
    await banco.produtos.update(inativo.id, { ativo: false });

    const { result } = renderHook(() => useProdutos(usuarioId));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.dados).toEqual([ativo]));
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("retorna lista vazia sem registros", async () => {
    const { result } = renderHook(() => useProdutos(usuarioId));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
  });

  it("expõe a falha de leitura do repositório", async () => {
    vi.spyOn(repositorio, "listarProdutos").mockRejectedValue(new Error("Falha de leitura"));
    const { result } = renderHook(() => useProdutos(usuarioId));
    await waitFor(() => expect(result.current.erro).toBe("Falha de leitura"));
  });

  it("cria produto pelo repositório com os dados recebidos", async () => {
    const { result } = renderHook(() => useProdutos(usuarioId));
    let criado: Awaited<ReturnType<typeof repositorio.criarProduto>> | undefined;
    await act(async () => {
      criado = await result.current.criar({ nome: "Arroz", tipoMedida: "peso" });
    });
    expect(criado).toMatchObject({ nome: "Arroz", tipo_medida: "peso", ativo: true });
    await waitFor(() => expect(result.current.dados).toEqual([criado]));
  });
});
