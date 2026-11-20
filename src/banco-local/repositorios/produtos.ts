/** Persiste e consulta produtos locais. */
import { produtoSchema } from "../../esquemas/cadastros";
import { unidadeCompativel } from "../../esquemas/unidade";
import type { Atualizacao, DadosProduto, Identificador, Produto } from "../../tipos/banco-local";
import {
  atualizarControleSincronizacao,
  novoControleSincronizacao,
  registrarExclusaoSincronizacao,
} from "../controle";
import type { BancoLocal } from "../esquema";

/** Repositório Dexie de produtos genéricos, com desativação se houver compras (RN06, RN13). */
export async function criarProduto(banco: BancoLocal, entrada: DadosProduto): Promise<Produto> {
  const dados = produtoSchema.parse(entrada);
  const agora = new Date().toISOString();
  const produto: Produto = {
    id: crypto.randomUUID(),
    nome: dados.nome,
    tipo_medida: dados.tipoMedida,
    ativo: true,
    criado_em: agora,
    ...novoControleSincronizacao(agora),
  };
  await banco.produtos.add(produto);
  return produto;
}

export async function listarProdutos(banco: BancoLocal): Promise<Produto[]> {
  return (await banco.produtos.toArray()).filter((item) => item.ativo);
}

export async function atualizarProduto(
  banco: BancoLocal,
  entrada: Atualizacao<DadosProduto>,
): Promise<Produto> {
  const dados = produtoSchema.parse(entrada.dados);
  return banco.transaction(
    "rw",
    [banco.produtos, banco.itens_lista, banco.itens_compra],
    async () => {
      const atual = await banco.produtos.get(entrada.id);
      if (!atual) throw new Error("Produto não encontrado.");
      if (!atual.ativo) throw new Error("Produto desativado não pode ser editado.");

      if (dados.tipoMedida !== atual.tipo_medida) {
        const [itensPadrao, itensCompra] = await Promise.all([
          banco.itens_lista.where("produto_id").equals(atual.id).toArray(),
          banco.itens_compra.where("produto_id").equals(atual.id).toArray(),
        ]);
        if (itensCompra.length > 0) {
          throw new Error(
            "O tipo de medida não pode mudar depois de entrar no histórico de compras.",
          );
        }
        const unidades = [
          ...itensPadrao.map((item) => item.unidade_padrao),
          ...itensCompra.map((item) => item.unidade),
        ];
        if (unidades.some((unidade) => !unidadeCompativel(dados.tipoMedida, unidade))) {
          throw new Error("O tipo de medida deixaria itens existentes com unidade incompatível.");
        }
      }

      const atualizado: Produto = {
        ...atual,
        nome: dados.nome,
        tipo_medida: dados.tipoMedida,
        ...atualizarControleSincronizacao(atual, new Date().toISOString()),
      };
      await banco.produtos.put(atualizado);
      return atualizado;
    },
  );
}
export async function excluirProduto(banco: BancoLocal, entrada: Identificador): Promise<void> {
  await banco.transaction("rw", banco.produtos, banco.itens_lista, banco.itens_compra, async () => {
    const atual = await banco.produtos.get(entrada.id);
    if (!atual) return;

    const possuiHistorico = await banco.itens_compra.where("produto_id").equals(entrada.id).count();
    if (possuiHistorico > 0) {
      const agora = new Date().toISOString();
      await banco.produtos.put({
        ...atual,
        ativo: false,
        ...registrarExclusaoSincronizacao(atual, agora),
      });
      return;
    }

    await banco.itens_lista.where("produto_id").equals(entrada.id).delete();
    await banco.produtos.delete(entrada.id);
  });
}
