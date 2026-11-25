/** Testa leitura reativa, falhas e escrita de supermercados. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { abrirBanco, fecharBanco } from "../local-db/abrir-banco";
import * as repositorio from "../local-db/repositories/supermercados";
import { uuidSchema } from "../schemas/comum";
import { useSupermercados } from "./use-supermercados";

let usuarioId: string;
let banco: ReturnType<typeof abrirBanco>;

beforeEach(() => {
  usuarioId = crypto.randomUUID();
  banco = abrirBanco(usuarioId);
});

afterEach(async () => {
  vi.restoreAllMocks();
  if (uuidSchema.safeParse(usuarioId).success) await fecharBanco(usuarioId);
});

describe("useSupermercados", () => {
  it("devolve estado vazio e rejeita escrita para usuário inválido", async () => {
    const { result } = renderHook(() => useSupermercados(""));
    expect(result.current.dados).toEqual([]);
    expect(result.current.carregando).toBe(false);
    await expect(result.current.criar({ nome: "Mercado" })).rejects.toThrow(
      "Identificador de usuário inválido.",
    );
  });

  it("retorna supermercados ativos e atualiza o estado de carregamento", async () => {
    const ativo = await repositorio.criarSupermercado(banco, { nome: "Mercado ativo" });
    const inativo = await repositorio.criarSupermercado(banco, { nome: "Mercado inativo" });
    await banco.supermercados.update(inativo.id, { ativo: false });

    const { result } = renderHook(() => useSupermercados(usuarioId));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.dados).toEqual([ativo]));
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("retorna lista vazia sem registros", async () => {
    const { result } = renderHook(() => useSupermercados(usuarioId));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
  });

  it("expõe a falha de leitura do repositório", async () => {
    vi.spyOn(repositorio, "listarSupermercados").mockRejectedValue(new Error("Falha de leitura"));
    const { result } = renderHook(() => useSupermercados(usuarioId));
    await waitFor(() => expect(result.current.erro).toBe("Falha de leitura"));
  });

  it("cria supermercado pelo repositório com os dados recebidos", async () => {
    const { result } = renderHook(() => useSupermercados(usuarioId));
    let criado: Awaited<ReturnType<typeof repositorio.criarSupermercado>> | undefined;
    await act(async () => {
      criado = await result.current.criar({ nome: "Mercado Central" });
    });
    expect(criado).toMatchObject({ nome: "Mercado Central", ativo: true });
    await waitFor(() => expect(result.current.dados).toEqual([criado]));
  });
});
