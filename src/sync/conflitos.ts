/** Aplica cadastros remotos pela regra de atualização mais recente. */
import {
  produtoSincronizadoSchema,
  supermercadoSincronizadoSchema,
  tipoListaSincronizadoSchema,
} from "../schemas/sincronizacao";
import type {
  Produto,
  ProdutoRecebido,
  Supermercado,
  SupermercadoRecebido,
  TipoLista,
  TipoListaRecebido,
} from "../types/banco-local";
import type { BancoLocal } from "../local-db/esquema";

/** Aplica um cadastro recebido somente quando ele é mais recente que a cópia local (conflitos). */
export async function aplicarSupermercadoRecebido(
  banco: BancoLocal,
  entrada: SupermercadoRecebido,
): Promise<Supermercado> {
  const remoto = supermercadoSincronizadoSchema.parse(entrada);
  return banco.transaction("rw", banco.supermercados, async () => {
    const atual = await banco.supermercados.get(remoto.id);
    if (atual && atual.atualizado_em >= remoto.atualizadoEm) return atual;
    const salvo: Supermercado = {
      id: remoto.id,
      nome: remoto.nome,
      ativo: remoto.ativo,
      criado_em: remoto.criadoEm,
      atualizado_em: remoto.atualizadoEm,
      versao: (atual?.versao ?? 0) + 1,
      estado_sincronizacao: "sincronizado",
      excluido_em: remoto.ativo ? null : remoto.atualizadoEm,
    };
    await banco.supermercados.put(salvo);
    return salvo;
  });
}

export async function aplicarTipoListaRecebido(
  banco: BancoLocal,
  entrada: TipoListaRecebido,
): Promise<TipoLista> {
  const remoto = tipoListaSincronizadoSchema.parse(entrada);
  return banco.transaction("rw", banco.tipos_lista, async () => {
    const atual = await banco.tipos_lista.get(remoto.id);
    if (atual && atual.atualizado_em >= remoto.atualizadoEm) return atual;
        const salvo: TipoLista = {
      id: remoto.id,
      nome: remoto.nome,
      // Preserva a cor local: o servidor ainda não envia esse campo.
      cor: atual?.cor ?? "verde",
      ativo: remoto.ativo,
      criado_em: remoto.criadoEm,
      atualizado_em: remoto.atualizadoEm,
      versao: (atual?.versao ?? 0) + 1,
      estado_sincronizacao: "sincronizado",
      excluido_em: remoto.ativo ? null : remoto.atualizadoEm,
    };
    await banco.tipos_lista.put(salvo);
    return salvo;
  });
}

export async function aplicarProdutoRecebido(
  banco: BancoLocal,
  entrada: ProdutoRecebido,
): Promise<Produto> {
  const remoto = produtoSincronizadoSchema.parse(entrada);
  return banco.transaction("rw", banco.produtos, async () => {
    const atual = await banco.produtos.get(remoto.id);
    if (atual && atual.atualizado_em >= remoto.atualizadoEm) return atual;
    const salvo: Produto = {
      id: remoto.id,
      nome: remoto.nome,
      tipo_medida: remoto.tipoMedida,
      ativo: remoto.ativo,
      criado_em: remoto.criadoEm,
      atualizado_em: remoto.atualizadoEm,
      versao: (atual?.versao ?? 0) + 1,
      estado_sincronizacao: "sincronizado",
      excluido_em: remoto.ativo ? null : remoto.atualizadoEm,
    };
    await banco.produtos.put(salvo);
    return salvo;
  });
}
