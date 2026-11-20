/** Persiste os itens padrão das listas de compra. */
import { itemListaSchema } from "../../schemas/cadastros";
import { unidadeCompativel } from "../../schemas/unidade";
import type {
  Atualizacao,
  DadosItemLista,
  Identificador,
  ItemLista,
  ItensDeTipoLista,
} from "../../types/banco-local";
import { atualizarControleSincronizacao, novoControleSincronizacao } from "../controle";
import type { BancoLocal } from "../esquema";

type ItemListaEntradaUsuario = DadosItemLista;

/** Repositório dos itens padrão da lista, sem alterar os itens já copiados para compras (RN05). */
export async function criarItemLista(
  banco: BancoLocal,
  entrada: ItemListaEntradaUsuario,
): Promise<ItemLista> {
  const dados = itemListaSchema.parse(entrada);
  return banco.transaction(
    "rw",
    [banco.tipos_lista, banco.produtos, banco.itens_lista],
    async () => {
      const [tipoLista, produto] = await Promise.all([
        banco.tipos_lista.get(dados.tipoListaId),
        banco.produtos.get(dados.produtoId),
      ]);
      if (!tipoLista?.ativo) throw new Error("Tipo de lista ativo não encontrado.");
      if (!produto?.ativo) throw new Error("Produto ativo não encontrado.");
      if (!unidadeCompativel(produto.tipo_medida, dados.unidadePadrao)) {
        throw new Error("Unidade incompatível com o tipo de medida do produto.");
      }

      const agora = new Date().toISOString();
      const itemLista: ItemLista = {
        id: crypto.randomUUID(),
        tipo_lista_id: dados.tipoListaId,
        produto_id: dados.produtoId,
        quantidade_padrao: dados.quantidadePadrao,
        unidade_padrao: dados.unidadePadrao,
        marca: dados.marca,
        observacao: dados.observacao,
        criado_em: agora,
        ...novoControleSincronizacao(agora),
      };
      await banco.itens_lista.add(itemLista);
      return itemLista;
    },
  );
}

export async function listarItensLista(
  banco: BancoLocal,
  entrada: ItensDeTipoLista,
): Promise<ItemLista[]> {
  return banco.itens_lista.where("tipo_lista_id").equals(entrada.tipoListaId).toArray();
}

export async function atualizarItemLista(
  banco: BancoLocal,
  entrada: Atualizacao<ItemListaEntradaUsuario>,
): Promise<ItemLista> {
  const dados = itemListaSchema.parse(entrada.dados);
  return banco.transaction(
    "rw",
    [banco.itens_lista, banco.tipos_lista, banco.produtos],
    async () => {
      const atual = await banco.itens_lista.get(entrada.id);
      if (!atual) throw new Error("Item padrão não encontrado.");
      const [tipoLista, produto] = await Promise.all([
        banco.tipos_lista.get(dados.tipoListaId),
        banco.produtos.get(dados.produtoId),
      ]);
      if (!tipoLista?.ativo) throw new Error("Tipo de lista ativo não encontrado.");
      if (!produto?.ativo) throw new Error("Produto ativo não encontrado.");
      if (!unidadeCompativel(produto.tipo_medida, dados.unidadePadrao)) {
        throw new Error("Unidade incompatível com o tipo de medida do produto.");
      }

      const atualizado: ItemLista = {
        ...atual,
        tipo_lista_id: dados.tipoListaId,
        produto_id: dados.produtoId,
        quantidade_padrao: dados.quantidadePadrao,
        unidade_padrao: dados.unidadePadrao,
        marca: dados.marca,
        observacao: dados.observacao,
        ...atualizarControleSincronizacao(atual, new Date().toISOString()),
      };
      await banco.itens_lista.put(atualizado);
      return atualizado;
    },
  );
}

export async function excluirItemLista(banco: BancoLocal, entrada: Identificador): Promise<void> {
  await banco.itens_lista.delete(entrada.id);
}
