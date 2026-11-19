/** Persiste e consulta tipos de lista locais. */
import { tipoListaSchema } from "../../esquemas/cadastros";
import type {
  Atualizacao,
  DadosTipoLista,
  Identificador,
  TipoLista,
} from "../../tipos/banco-local";
import { atualizarControleSincronizacao, novoControleSincronizacao } from "../controle";
import type { BancoLocal } from "../esquema";

/** Repositório Dexie de tipos de lista; preserva compras históricas (RN13, P1). */
export async function criarTipoLista(
  banco: BancoLocal,
  entrada: DadosTipoLista,
): Promise<TipoLista> {
  const dados = tipoListaSchema.parse(entrada);
  const agora = new Date().toISOString();
  const tipoLista: TipoLista = {
    id: crypto.randomUUID(),
    nome: dados.nome,
    ativo: true,
    criado_em: agora,
    ...novoControleSincronizacao(agora),
  };
  await banco.tipos_lista.add(tipoLista);
  return tipoLista;
}

export async function listarTiposLista(banco: BancoLocal): Promise<TipoLista[]> {
  return (await banco.tipos_lista.toArray()).filter(
    (item) => item.ativo && item.excluido_em === null,
  );
}

export async function atualizarTipoLista(
  banco: BancoLocal,
  entrada: Atualizacao<DadosTipoLista>,
): Promise<TipoLista> {
  const dados = tipoListaSchema.parse(entrada.dados);
  const atual = await banco.tipos_lista.get(entrada.id);
  if (!atual) throw new Error("Tipo de lista não encontrado.");
  if (!atual.ativo) throw new Error("Tipo de lista desativado não pode ser editado.");
  const atualizado = {
    ...atual,
    nome: dados.nome,
    ...atualizarControleSincronizacao(atual, new Date().toISOString()),
  };
  await banco.tipos_lista.put(atualizado);
  return atualizado;
}

export async function excluirTipoLista(banco: BancoLocal, entrada: Identificador): Promise<void> {
  await banco.transaction("rw", banco.tipos_lista, banco.itens_lista, banco.compras, async () => {
    const atual = await banco.tipos_lista.get(entrada.id);
    if (!atual) return;

    const possuiHistorico = await banco.compras.where("tipo_lista_id").equals(entrada.id).count();
    if (possuiHistorico > 0) {
      const agora = new Date().toISOString();
      await banco.tipos_lista.put({
        ...atual,
        ativo: false,
        excluido_em: agora,
        ...atualizarControleSincronizacao(atual, agora),
      });
      return;
    }

    await banco.itens_lista.where("tipo_lista_id").equals(entrada.id).delete();
    await banco.tipos_lista.delete(entrada.id);
  });
}
