/** Testa os estados compartilhados de leitura reativa e execução de operações. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useConsultaReativa } from "./use-consulta-reativa";

describe("useConsultaReativa", () => {
  it("expõe carregamento até a consulta retornar os dados", async () => {
    let concluirConsulta: ((dados: string[]) => void) | undefined;
    const consulta = new Promise<string[]>((resolver) => {
      concluirConsulta = resolver;
    });
    const { result } = renderHook(() => useConsultaReativa(() => consulta, []));

    expect(result.current.carregando).toBe(true);
    await act(async () => concluirConsulta?.(["registro"]));
    await waitFor(() => expect(result.current.dados).toEqual(["registro"]));
    expect(result.current.carregando).toBe(false);
  });

  it("preserva uma lista vazia retornada pela consulta", async () => {
    const { result } = renderHook(() => useConsultaReativa(async () => [], []));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
    expect(result.current.erro).toBeNull();
  });

  it("expõe a mensagem quando a consulta falha", async () => {
    const { result } = renderHook(() =>
      useConsultaReativa(async () => {
        throw new Error("Falha da consulta");
      }, []),
    );
    await waitFor(() => expect(result.current.erro).toBe("Falha da consulta"));
    expect(result.current.dados).toBeUndefined();
    expect(result.current.carregando).toBe(false);
  });

  it("registra o erro da escrita e mantém a rejeição para o chamador", async () => {
    const { result } = renderHook(() => useConsultaReativa(async () => "pronto", []));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    await act(async () => {
      await expect(
        result.current.executar(async () => {
          throw new Error("Falha da operação");
        }),
      ).rejects.toThrow("Falha da operação");
    });
    expect(result.current.erro).toBe("Falha da operação");
  });
});
