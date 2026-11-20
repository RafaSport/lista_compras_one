/** Persiste e consulta supermercados locais. */
import { supermercadoSchema } from "../../schemas/cadastros";
import type {
  Atualizacao,
  DadosSupermercado,
  Identificador,
  Supermercado,
} from "../../types/banco-local";
import {
  atualizarControleSincronizacao,
  novoControleSincronizacao,
  registrarExclusaoSincronizacao,
} from "../controle";
import type { BancoLocal } from "../esquema";

/** Repositório Dexie de supermercados, com desativação quando há compras vinculadas (RN13). */
export async function criarSupermercado(
  banco: BancoLocal,
  entrada: DadosSupermercado,
): Promise<Supermercado> {
  const dados = supermercadoSchema.parse(entrada);
  const agora = new Date().toISOString();
  const supermercado: Supermercado = {
    id: crypto.randomUUID(),
    nome: dados.nome,
    ativo: true,
    criado_em: agora,
    ...novoControleSincronizacao(agora),
  };

  await banco.supermercados.add(supermercado);
  return supermercado;
}

export async function listarSupermercados(banco: BancoLocal): Promise<Supermercado[]> {
  return (await banco.supermercados.toArray()).filter((item) => item.ativo);
}

export async function atualizarSupermercado(
  banco: BancoLocal,
  entrada: Atualizacao<DadosSupermercado>,
): Promise<Supermercado> {
  const dados = supermercadoSchema.parse(entrada.dados);
  const atual = await banco.supermercados.get(entrada.id);
  if (!atual) throw new Error("Supermercado não encontrado.");
  if (!atual.ativo) throw new Error("Supermercado desativado não pode ser editado.");

  const atualizado: Supermercado = {
    ...atual,
    nome: dados.nome,
    ...atualizarControleSincronizacao(atual, new Date().toISOString()),
  };
  await banco.supermercados.put(atualizado);
  return atualizado;
}

export async function excluirSupermercado(
  banco: BancoLocal,
  entrada: Identificador,
): Promise<void> {
  await banco.transaction("rw", banco.supermercados, banco.compras, async () => {
    const atual = await banco.supermercados.get(entrada.id);
    if (!atual) return;

    const possuiHistorico = await banco.compras.where("supermercado_id").equals(entrada.id).count();
    if (possuiHistorico > 0) {
      const agora = new Date().toISOString();
      await banco.supermercados.put({
        ...atual,
        ativo: false,
        ...registrarExclusaoSincronizacao(atual, agora),
      });
      return;
    }

    await banco.supermercados.delete(entrada.id);
  });
}
