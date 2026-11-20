/** Testa listagem reativa, consulta por id e escrita de compras. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { abrirBanco, fecharBanco } from "../local-db/abrir-banco";
import * as repositorio from "../local-db/repositories/compras";
import { criarSupermercado } from "../local-db/repositories/supermercados";
import { criarTipoLista } from "../local-db/repositories/tipos-lista";
import { useCompras } from "./use-compras";

let usuarioId: string;
let banco: ReturnType<typeof abrirBanco>;
let supermercadoId: string;
let tipoListaId: string;

beforeEach(async () => {
  usuarioId = crypto.randomUUID();
  banco = abrirBanco(usuarioId);
  supermercadoId = (await criarSupermercado(banco, { nome: "Mercado" })).id;
  tipoListaId = (await criarTipoLista(banco, { nome: "Alimentação" })).id;
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fecharBanco(usuarioId);
});

describe("useCompras", () => {
  it("retorna as compras e a compra correspondente ao id", async () => {
    const compra = await repositorio.criarCompra(banco, { supermercadoId, tipoListaId });
    const outra = await repositorio.criarCompra(banco, { supermercadoId, tipoListaId });
    const { result } = renderHook(() => useCompras(usuarioId, compra.id));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.compra?.id).toBe(compra.id));
    expect(result.current.dados.map((item) => item.id)).toEqual(
      expect.arrayContaining([compra.id, outra.id]),
    );
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("retorna lista vazia quando não há compras", async () => {
    const { result } = renderHook(() => useCompras(usuarioId));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
    expect(result.current.compra).toBeNull();
  });

  it("expõe a falha de leitura do repositório", async () => {
    vi.spyOn(repositorio, "listarCompras").mockRejectedValue(new Error("Falha de leitura"));
    const { result } = renderHook(() => useCompras(usuarioId));
    await waitFor(() => expect(result.current.erro).toBe("Falha de leitura"));
  });

  it("cria compra pelo repositório com os identificadores recebidos", async () => {
    const { result } = renderHook(() => useCompras(usuarioId));
    let criada: Awaited<ReturnType<typeof repositorio.criarCompra>> | undefined;
    await act(async () => {
      criada = await result.current.criar({ supermercadoId, tipoListaId });
    });
    expect(criada).toMatchObject({ supermercado_id: supermercadoId, tipo_lista_id: tipoListaId });
  });
});
