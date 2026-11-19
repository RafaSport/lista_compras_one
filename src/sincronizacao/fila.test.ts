/** Testes da fila ordenada e das tentativas de sincronização. */
import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BancoLocal } from "../banco-local/esquema";
import { enfileirarCompra, processarFilaSincronizacao, type EnviadorCompra } from "./fila";

let banco: BancoLocal;

beforeEach(() => {
  banco = new BancoLocal("teste-" + crypto.randomUUID());
});

afterEach(async () => {
  banco.close();
  await banco.delete();
  vi.unstubAllGlobals();
});

async function adicionarCompraNaFila(id: string, ordem: number): Promise<void> {
  const criado = new Date(Date.UTC(2026, 0, ordem)).toISOString();
  const sufixo = String(ordem).padStart(12, "0");
  const supermercadoId = `10000000-0000-4000-8000-${sufixo}`;
  const tipoListaId = `20000000-0000-4000-8000-${sufixo}`;
  const produtoId = `30000000-0000-4000-8000-${sufixo}`;
  await banco.supermercados.put({
    id: supermercadoId,
    nome: `Mercado ${ordem}`,
    ativo: true,
    criado_em: criado,
    versao: 1,
    estado_sincronizacao: "pendente",
    atualizado_em: criado,
    excluido_em: null,
  });
  await banco.tipos_lista.put({
    id: tipoListaId,
    nome: `Tipo ${ordem}`,
    ativo: true,
    criado_em: criado,
    versao: 1,
    estado_sincronizacao: "pendente",
    atualizado_em: criado,
    excluido_em: null,
  });
  await banco.produtos.put({
    id: produtoId,
    nome: `Produto ${ordem}`,
    tipo_medida: "unidade",
    ativo: true,
    criado_em: criado,
    versao: 1,
    estado_sincronizacao: "pendente",
    atualizado_em: criado,
    excluido_em: null,
  });
  await banco.compras.put({
    id,
    supermercado_id: supermercadoId,
    tipo_lista_id: tipoListaId,
    situacao: "finalizada",
    valor_total: 100,
    criada_em: criado,
    fechada_em: criado,
    finalizada_em: criado,
    salva_em: null,
    versao: 1,
    estado_sincronizacao: "pendente",
    atualizado_em: criado,
    excluido_em: null,
  });
  await banco.itens_compra.put({
    id: `40000000-0000-4000-8000-${sufixo}`,
    compra_id: id,
    produto_id: produtoId,
    situacao: "comprado",
    quantidade: 1,
    conteudo: 1,
    unidade: "un",
    valor_unitario: 100,
    valor_item: 100,
    unidade_base: "un",
    preco_unidade_base: 100,
    comprado_em: criado,
    criado_em: criado,
    versao: 1,
    estado_sincronizacao: "pendente",
    atualizado_em: criado,
    excluido_em: null,
  });
  await banco.fila_sincronizacao.put({
    id: `50000000-0000-4000-8000-${sufixo}`,
    compra_id: id,
    estado: "pendente",
    tentativas: 0,
    criada_em: criado,
    ultimo_erro: null,
    versao: 1,
    estado_sincronizacao: "pendente",
    atualizado_em: criado,
    excluido_em: null,
  });
}

const compraUm = "00000000-0000-4000-8000-000000000001";
const compraDois = "00000000-0000-4000-8000-000000000002";

describe("fila de sincronização", () => {
  it("envia na ordem, mantém falha e tenta as demais operações", async () => {
    await adicionarCompraNaFila(compraUm, 1);
    await adicionarCompraNaFila(compraDois, 2);
    const idsEnviados: string[] = [];
    const enviar = vi.fn<EnviadorCompra>(async (payload) => {
      idsEnviados.push(payload.compra.id);
      if (idsEnviados.length === 1) throw new Error("Sem conexão");
    });

    const resultado = await processarFilaSincronizacao(banco, enviar);

    expect(idsEnviados).toEqual([compraUm, compraDois]);
    expect(resultado).toEqual({ enviadas: 1, falhas: 1 });
    expect(
      await banco.fila_sincronizacao.where("compra_id").equals(compraUm).first(),
    ).toMatchObject({
      estado: "pendente",
      tentativas: 1,
      ultimo_erro: "Sem conexão",
    });
    expect(
      await banco.fila_sincronizacao.where("compra_id").equals(compraDois).first(),
    ).toMatchObject({
      estado: "concluida",
    });
  });

  it("não cria duas operações para a mesma compra", async () => {
    await adicionarCompraNaFila(compraUm, 1);
    const primeira = await enfileirarCompra(banco, { compraId: compraUm });
    const segunda = await enfileirarCompra(banco, { compraId: compraUm });
    expect(segunda.id).toBe(primeira.id);
    expect(await banco.fila_sincronizacao.where("compra_id").equals(compraUm).count()).toBe(1);
  });

  it("não reenvia operação concluída quando a fila é processada novamente", async () => {
    await adicionarCompraNaFila(compraUm, 1);
    const enviar = vi.fn<EnviadorCompra>(async () => undefined);

    expect(await processarFilaSincronizacao(banco, enviar)).toEqual({ enviadas: 1, falhas: 0 });
    expect(await processarFilaSincronizacao(banco, enviar)).toEqual({ enviadas: 0, falhas: 0 });
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(await banco.compras.get(compraUm)).toMatchObject({ salva_em: expect.any(String) });
  });
});
