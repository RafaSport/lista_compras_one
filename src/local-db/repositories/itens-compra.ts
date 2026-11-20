/** Persiste itens de compra e aplica os cálculos de domínio. */
import { itemCompraEdicaoSchema, comprarItemSchema } from "../../schemas/compras";
import { uuidSchema } from "../../schemas/comum";
import { calcularPrecoUnidadeBase } from "../../domain/calcular-preco-unidade-base";
import { calcularValorItem } from "../../domain/calcular-valor-item";
import { unidadeBaseDoTipo, unidadeCompativel } from "../../schemas/unidade";
import type {
  Atualizacao,
  CompraDeItem,
  DadosItemCompra,
  IdentificadorItemCompra,
  ItemCompra,
  ItensDeCompra,
  NovoItemCompra,
} from "../../types/banco-local";
import { atualizarControleSincronizacao, novoControleSincronizacao } from "../controle";
import type { BancoLocal } from "../esquema";

const novoItemCompraSchema = itemCompraEdicaoSchema.extend({
  compraId: uuidSchema,
  produtoId: uuidSchema,
});

/** Repositório de itens da compra. Os itens padrão nunca são alterados (RN05). */
export async function adicionarItemCompra(
  banco: BancoLocal,
  entrada: NovoItemCompra,
): Promise<ItemCompra> {
  const dados = novoItemCompraSchema.parse(entrada);
  return banco.transaction("rw", [banco.compras, banco.produtos, banco.itens_compra], async () => {
    const [compra, produto] = await Promise.all([
      banco.compras.get(dados.compraId),
      banco.produtos.get(dados.produtoId),
    ]);
    if (!compra || compra.situacao === "finalizada")
      throw new Error("Compra aberta não encontrada.");
    if (!produto?.ativo) throw new Error("Produto ativo não encontrado.");
    if (!unidadeCompativel(produto.tipo_medida, dados.unidade)) {
      throw new Error("Unidade incompatível com o tipo de medida do produto.");
    }
    const agora = new Date().toISOString();
    const item: ItemCompra = {
      id: crypto.randomUUID(),
      compra_id: compra.id,
      produto_id: produto.id,
      situacao: "pendente",
      quantidade: dados.quantidade,
      embalagem: dados.embalagem,
      conteudo: dados.conteudo,
      unidade: dados.unidade,
      marca: dados.marca,
      observacao: dados.observacao,
      valor_unitario: null,
      valor_item: null,
      unidade_base: null,
      preco_unidade_base: null,
      comprado_em: null,
      criado_em: agora,
      ...novoControleSincronizacao(agora),
    };
    await banco.itens_compra.add(item);
    return item;
  });
}

export async function listarItensCompra(
  banco: BancoLocal,
  entrada: ItensDeCompra,
): Promise<ItemCompra[]> {
  return banco.itens_compra.where("compra_id").equals(entrada.compraId).toArray();
}

export async function atualizarItemCompra(
  banco: BancoLocal,
  entrada: Atualizacao<DadosItemCompra>,
): Promise<ItemCompra> {
  const dados = itemCompraEdicaoSchema.parse(entrada.dados);
  return banco.transaction("rw", [banco.itens_compra, banco.compras, banco.produtos], async () => {
    const item = await banco.itens_compra.get(entrada.id);
    if (!item) throw new Error("Item da compra não encontrado.");
    const compra = await banco.compras.get(item.compra_id);
    if (!compra || compra.situacao === "finalizada")
      throw new Error("Compra finalizada é imutável.");
    if (item.situacao === "comprado")
      throw new Error("Desfaça a compra do item antes de editá-lo.");
    const produto = await banco.produtos.get(item.produto_id);
    if (!produto || !unidadeCompativel(produto.tipo_medida, dados.unidade)) {
      throw new Error("Unidade incompatível com o tipo de medida do produto.");
    }
    const atualizado: ItemCompra = {
      ...item,
      quantidade: dados.quantidade,
      unidade: dados.unidade,
      embalagem: dados.embalagem,
      conteudo: dados.conteudo,
      marca: dados.marca,
      observacao: dados.observacao,
      ...atualizarControleSincronizacao(item, new Date().toISOString()),
    };
    await banco.itens_compra.put(atualizado);
    return atualizado;
  });
}

export async function comprarItem(banco: BancoLocal, entrada: CompraDeItem): Promise<ItemCompra> {
  const dados: CompraDeItem = comprarItemSchema.parse(entrada);
  return banco.transaction("rw", banco.compras, banco.itens_compra, banco.produtos, async () => {
    const item = await banco.itens_compra.get(dados.itemId);
    if (!item) throw new Error("Item da compra não encontrado.");
    if (item.situacao === "comprado") throw new Error("O item já foi comprado.");
    const compra = await banco.compras.get(item.compra_id);
    if (!compra || compra.situacao === "finalizada")
      throw new Error("Compra finalizada é imutável.");
    const produto = await banco.produtos.get(item.produto_id);
    if (!produto || !unidadeCompativel(produto.tipo_medida, item.unidade)) {
      throw new Error("Unidade incompatível com o tipo de medida do produto.");
    }
    const agora = new Date().toISOString();
    const atualizado: ItemCompra = {
      ...item,
      situacao: "comprado",
      valor_unitario: dados.valorUnitario,
      valor_item: calcularValorItem(item.quantidade, dados.valorUnitario),
      unidade_base: unidadeBaseDoTipo(produto.tipo_medida),
      preco_unidade_base: calcularPrecoUnidadeBase(
        dados.valorUnitario,
        item.conteudo,
        item.unidade,
      ),
      comprado_em: agora,
      ...atualizarControleSincronizacao(item, agora),
    };
    await banco.itens_compra.put(atualizado);
    return atualizado;
  });
}

export async function desfazerCompraItem(
  banco: BancoLocal,
  entrada: IdentificadorItemCompra,
): Promise<ItemCompra> {
  return banco.transaction("rw", banco.compras, banco.itens_compra, async () => {
    const item = await banco.itens_compra.get(entrada.itemId);
    if (!item) throw new Error("Item da compra não encontrado.");
    const compra = await banco.compras.get(item.compra_id);
    if (!compra || compra.situacao === "finalizada")
      throw new Error("Compra finalizada é imutável.");
    if (item.situacao !== "comprado") throw new Error("O item ainda não foi comprado.");
    const atualizado: ItemCompra = {
      ...item,
      situacao: "pendente",
      valor_item: null,
      unidade_base: null,
      preco_unidade_base: null,
      comprado_em: null,
      ...atualizarControleSincronizacao(item, new Date().toISOString()),
    };
    await banco.itens_compra.put(atualizado);
    return atualizado;
  });
}

export async function excluirItemCompra(
  banco: BancoLocal,
  entrada: IdentificadorItemCompra,
): Promise<void> {
  await banco.transaction("rw", banco.itens_compra, banco.compras, async () => {
    const item = await banco.itens_compra.get(entrada.itemId);
    if (!item) return;
    const compra = await banco.compras.get(item.compra_id);
    if (!compra || compra.situacao === "finalizada")
      throw new Error("Compra finalizada é imutável.");
    if (item.situacao !== "pendente")
      throw new Error("Desfaça o item comprado antes de excluí-lo.");
    await banco.itens_compra.delete(item.id);
  });
}
