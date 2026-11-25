/** Testa leitura reativa, falhas e escrita de tipos de lista. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { abrirBanco, fecharBanco } from "../local-db/abrir-banco";
import * as repositorio from "../local-db/repositories/tipos-lista";
import { uuidSchema } from "../schemas/comum";
import { useTiposLista } from "./use-tipos-lista";

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

describe("useTiposLista", () => {
  it("devolve estado vazio e rejeita escrita para usuário inválido", async () => {
    const { result } = renderHook(() => useTiposLista(""));
    expect(result.current.dados).toEqual([]);
    expect(result.current.carregando).toBe(false);
    await expect(result.current.criar({ nome: "Alimentação" })).rejects.toThrow(
      "Identificador de usuário inválido.",
    );
  });

  it("retorna tipos ativos e atualiza o estado de carregamento", async () => {
    const ativo = await repositorio.criarTipoLista(banco, { nome: "Alimentação" });
    const inativo = await repositorio.criarTipoLista(banco, { nome: "Higiene" });
    await banco.tipos_lista.update(inativo.id, { ativo: false });

    const { result } = renderHook(() => useTiposLista(usuarioId));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.dados).toEqual([ativo]));
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("retorna lista vazia sem registros", async () => {
    const { result } = renderHook(() => useTiposLista(usuarioId));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
  });

  it("expõe a falha de leitura do repositório", async () => {
    vi.spyOn(repositorio, "listarTiposLista").mockRejectedValue(new Error("Falha de leitura"));
    const { result } = renderHook(() => useTiposLista(usuarioId));
    await waitFor(() => expect(result.current.erro).toBe("Falha de leitura"));
  });

  it("cria tipo de lista pelo repositório com os dados recebidos", async () => {
    const { result } = renderHook(() => useTiposLista(usuarioId));
    let criado: Awaited<ReturnType<typeof repositorio.criarTipoLista>> | undefined;
    await act(async () => {
      criado = await result.current.criar({ nome: "Alimentação" });
    });
    expect(criado).toMatchObject({ nome: "Alimentação", ativo: true });
    await waitFor(() => expect(result.current.dados).toEqual([criado]));
  });
});
