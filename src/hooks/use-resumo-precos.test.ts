/** Testa o resumo reativo, a média derivada e falhas de leitura. */
// @vitest-environment jsdom

import "fake-indexeddb/auto";

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { abrirBanco, fecharBanco } from "../local-db/abrir-banco";
import * as repositorio from "../local-db/repositories/resumo-precos";
import { criarProduto } from "../local-db/repositories/produtos";
import { criarSupermercado } from "../local-db/repositories/supermercados";
import { reconstruirResumoPreco } from "../local-db/repositories/resumo-precos";
import { useResumoPrecos } from "./use-resumo-precos";

let usuarioId: string;
let banco: ReturnType<typeof abrirBanco>;
let produtoId: string;
let supermercadoId: string;

beforeEach(async () => {
  usuarioId = crypto.randomUUID();
  banco = abrirBanco(usuarioId);
  produtoId = (await criarProduto(banco, { nome: "Leite", tipoMedida: "volume" })).id;
  supermercadoId = (await criarSupermercado(banco, { nome: "Mercado" })).id;
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fecharBanco(usuarioId);
});

async function prepararHistoricoDePrecos(): Promise<void> {
  const historico = [
    { valor: 100, data: "2026-01-01T10:00:00.000Z" },
    { valor: 300, data: "2026-01-02T10:00:00.000Z" },
  ];
  for (const [indice, registro] of historico.entries()) {
    const compraId = crypto.randomUUID();
    await banco.compras.put({
      id: compraId,
      supermercado_id: supermercadoId,
      tipo_lista_id: crypto.randomUUID(),
      situacao: "finalizada",
      valor_total: registro.valor,
      criada_em: registro.data,
      fechada_em: registro.data,
      finalizada_em: registro.data,
      salva_em: null,
      versao: 1,
      estado_sincronizacao: "pendente",
      excluido_em: null,
      atualizado_em: registro.data,
    });
    await banco.itens_compra.put({
      id: crypto.randomUUID(),
      compra_id: compraId,
      produto_id: produtoId,
      situacao: "comprado",
      quantidade: 1,
      conteudo: 1,
      unidade: "L",
      valor_unitario: registro.valor,
      valor_item: registro.valor,
      unidade_base: "L",
      preco_unidade_base: registro.valor,
      comprado_em: registro.data,
      criado_em: registro.data,
      versao: 1,
      estado_sincronizacao: "pendente",
      excluido_em: null,
      atualizado_em: registro.data,
    });
    if (indice === historico.length - 1) {
      await reconstruirResumoPreco(banco, { produtoId, supermercadoId });
    }
  }
}

describe("useResumoPrecos", () => {
  it("retorna último valor e média derivados do resumo", async () => {
    await prepararHistoricoDePrecos();
    const { result } = renderHook(() => useResumoPrecos(usuarioId, produtoId, "L"));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.dados).toHaveLength(1));
    expect(result.current.dados[0]).toMatchObject({ ultimo_valor: 300, valor_medio: 200 });
    expect(result.current.maisEmConta).toMatchObject({ ultimo_valor: 300, valor_medio: 200 });
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("retorna lista vazia e nenhum supermercado quando não há preços", async () => {
    const { result } = renderHook(() => useResumoPrecos(usuarioId, produtoId, "L"));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([]);
    expect(result.current.maisEmConta).toBeNull();
  });

  it("expõe a falha de leitura do repositório", async () => {
    vi.spyOn(repositorio, "listarResumoPrecos").mockRejectedValue(new Error("Falha de leitura"));
    const { result } = renderHook(() => useResumoPrecos(usuarioId, produtoId));
    await waitFor(() => expect(result.current.erro).toBe("Falha de leitura"));
  });
});
