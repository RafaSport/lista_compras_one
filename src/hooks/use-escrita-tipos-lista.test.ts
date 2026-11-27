import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEscritaTiposLista } from "./use-escrita-tipos-lista";

const criarTipoLista = vi.fn();
const atualizarTipoLista = vi.fn();
const abrirBanco = vi.fn();

vi.mock("../local-db/abrir-banco", () => ({
  abrirBanco: (id: string) => abrirBanco(id),
}));

vi.mock("../local-db/repositories/tipos-lista", () => ({
  criarTipoLista: (...args: unknown[]) => criarTipoLista(...args),
  atualizarTipoLista: (...args: unknown[]) => atualizarTipoLista(...args),
}));

const USUARIO_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

describe("useEscritaTiposLista", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    abrirBanco.mockReturnValue({ nome: "banco-falso" });
  });

  it("cria a lista e devolve o registro", async () => {
    const criado = { id: "lista-1", nome: "Alimentos", cor: "verde" };
    criarTipoLista.mockResolvedValue(criado);

    const { result } = renderHook(() => useEscritaTiposLista(USUARIO_ID));

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar({ nome: "Alimentos", cor: "verde" });
    });

    expect(retorno).toEqual(criado);
    expect(abrirBanco).toHaveBeenCalledWith(USUARIO_ID);
    expect(result.current.erro).toBeNull();
  });

  it("atualiza a lista e devolve o registro", async () => {
    const atualizado = { id: "lista-1", nome: "Carnes", cor: "laranja" };
    atualizarTipoLista.mockResolvedValue(atualizado);

    const { result } = renderHook(() => useEscritaTiposLista(USUARIO_ID));

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.atualizar({
        id: "lista-1",
        dados: { nome: "Carnes", cor: "laranja" },
      });
    });

    expect(retorno).toEqual(atualizado);
    expect(result.current.erro).toBeNull();
  });

  it("guarda a mensagem de erro e propaga a rejeição ao criar", async () => {
    criarTipoLista.mockRejectedValue(new Error("Falha ao gravar"));

    const { result } = renderHook(() => useEscritaTiposLista(USUARIO_ID));

    await act(async () => {
      await expect(
        result.current.criar({ nome: "Alimentos", cor: "verde" }),
      ).rejects.toThrow("Falha ao gravar");
    });

    expect(result.current.erro).toBe("Falha ao gravar");
  });

  it("recusa usuarioId inválido sem abrir o banco", async () => {
    const { result } = renderHook(() => useEscritaTiposLista("id-invalido"));

    await act(async () => {
      await expect(
        result.current.criar({ nome: "Alimentos", cor: "verde" }),
      ).rejects.toThrow("Identificador de usuário inválido.");
    });

    expect(abrirBanco).not.toHaveBeenCalled();
  });
});