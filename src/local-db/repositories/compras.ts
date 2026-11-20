/** Persiste compras e coordena sua finalização local. */
import { novaCompraSchema } from "../../schemas/compras";
import { podeFinalizarCompra } from "../../domain/pode-finalizar-compra";
import { calcularTotalCompra } from "../../domain/calcular-total-compra";
import type {
  Compra,
  IdentificadorCompra,
  ItemCompra,
  NovaCompraLocal,
  OperacaoSincronizacao,
} from "../../types/banco-local";
import { atualizarControleSincronizacao, novoControleSincronizacao } from "../controle";
import type { BancoLocal } from "../esquema";
import { reconstruirResumoPreco } from "./resumo-precos";

/** Cria compras locais e coordena fechamento, total, histórico e fila (RF04, RF15, RN11). */
export async function criarCompra(banco: BancoLocal, entrada: NovaCompraLocal): Promise<Compra> {
  const dados = novaCompraSchema.parse(entrada);
  return banco.transaction(
    "rw",
    [
      banco.supermercados,
      banco.tipos_lista,
      banco.produtos,
      banco.itens_lista,
      banco.compras,
      banco.itens_compra,
    ],
    async () => {
      const [supermercado, tipoLista] = await Promise.all([
        banco.supermercados.get(dados.supermercadoId),
        banco.tipos_lista.get(dados.tipoListaId),
      ]);
      if (!supermercado?.ativo) throw new Error("Supermercado ativo não encontrado.");
      if (!tipoLista?.ativo) throw new Error("Tipo de lista ativo não encontrado.");

      const agora = new Date().toISOString();
      const compra: Compra = {
        id: crypto.randomUUID(),
        supermercado_id: dados.supermercadoId,
        tipo_lista_id: dados.tipoListaId,
        situacao: "em_montagem",
        valor_total: null,
        criada_em: agora,
        fechada_em: null,
        finalizada_em: null,
        salva_em: null,
        ...novoControleSincronizacao(agora),
      };
      await banco.compras.add(compra);

      const itensPadrao = await banco.itens_lista
        .where("tipo_lista_id")
        .equals(dados.tipoListaId)
        .toArray();
      const itensCompra: ItemCompra[] = [];
      for (const itemPadrao of itensPadrao) {
        const produto = await banco.produtos.get(itemPadrao.produto_id);
        if (!produto?.ativo) continue;
        itensCompra.push({
          id: crypto.randomUUID(),
          compra_id: compra.id,
          produto_id: produto.id,
          situacao: "pendente",
          quantidade: itemPadrao.quantidade_padrao,
          conteudo: 1,
          unidade: itemPadrao.unidade_padrao,
          marca: itemPadrao.marca,
          observacao: itemPadrao.observacao,
          valor_unitario: null,
          valor_item: null,
          unidade_base: null,
          preco_unidade_base: null,
          comprado_em: null,
          criado_em: agora,
          ...novoControleSincronizacao(agora),
        });
      }
      if (itensCompra.length > 0) await banco.itens_compra.bulkAdd(itensCompra);
      return compra;
    },
  );
}

export async function listarCompras(banco: BancoLocal): Promise<Compra[]> {
  return banco.compras.orderBy("criada_em").reverse().toArray();
}

export async function fecharListaCompra(
  banco: BancoLocal,
  entrada: IdentificadorCompra,
): Promise<Compra> {
  const compra = await banco.compras.get(entrada.compraId);
  if (!compra) throw new Error("Compra não encontrada.");
  if (compra.situacao !== "em_montagem")
    throw new Error("Somente compras em montagem podem ser fechadas.");
  const agora = new Date().toISOString();
  const atualizada: Compra = {
    ...compra,
    situacao: "em_aberto",
    fechada_em: agora,
    ...atualizarControleSincronizacao(compra, agora),
  };
  await banco.compras.put(atualizada);
  return atualizada;
}

export async function finalizarCompra(
  banco: BancoLocal,
  entrada: IdentificadorCompra,
): Promise<Compra> {
  return banco.transaction(
    "rw",
    banco.compras,
    banco.itens_compra,
    banco.resumo_precos,
    banco.produtos,
    banco.fila_sincronizacao,
    async () => {
      const compra = await banco.compras.get(entrada.compraId);
      if (!compra) throw new Error("Compra não encontrada.");
      if (compra.situacao === "finalizada") return compra;
      if (compra.situacao !== "em_aberto")
        throw new Error("Somente compras abertas podem ser finalizadas.");

      const itens = await banco.itens_compra.where("compra_id").equals(compra.id).toArray();
      if (!podeFinalizarCompra(itens.map((item) => ({ comprado: item.situacao === "comprado" })))) {
        throw new Error("A compra precisa ter itens e todos devem estar comprados.");
      }
      const agora = new Date().toISOString();
      const finalizada: Compra = {
        ...compra,
        situacao: "finalizada",
        valor_total: calcularTotalCompra(
          itens.map((item) => ({
            valorItem: item.valor_item ?? 0,
            comprado: item.situacao === "comprado",
          })),
        ),
        finalizada_em: agora,
        ...atualizarControleSincronizacao(compra, agora),
      };
      await banco.compras.put(finalizada);

      const produtos = [...new Set(itens.map((item) => item.produto_id))];
      for (const produtoId of produtos) {
        await reconstruirResumoPreco(banco, {
          produtoId,
          supermercadoId: compra.supermercado_id,
        });
      }

      const operacaoExistente = await banco.fila_sincronizacao
        .where("compra_id")
        .equals(compra.id)
        .first();
      if (!operacaoExistente) {
        const operacao: OperacaoSincronizacao = {
          id: crypto.randomUUID(),
          compra_id: compra.id,
          estado: "pendente",
          tentativas: 0,
          criada_em: agora,
          ultimo_erro: null,
          ...novoControleSincronizacao(agora),
        };
        await banco.fila_sincronizacao.add(operacao);
      }
      return finalizada;
    },
  );
}

export async function excluirCompra(
  banco: BancoLocal,
  entrada: IdentificadorCompra,
): Promise<void> {
  await banco.transaction(
    "rw",
    banco.compras,
    banco.itens_compra,
    banco.fila_sincronizacao,
    banco.resumo_precos,
    banco.produtos,
    async () => {
      const compra = await banco.compras.get(entrada.compraId);
      if (!compra) return;
      if (compra.situacao === "finalizada" && compra.salva_em) {
        throw new Error("Compra já sincronizada deve ser excluída pelo servidor.");
      }
      const itens = await banco.itens_compra.where("compra_id").equals(compra.id).toArray();
      const produtos = [...new Set(itens.map((item) => item.produto_id))];
      await banco.itens_compra.where("compra_id").equals(compra.id).delete();
      await banco.fila_sincronizacao.where("compra_id").equals(compra.id).delete();
      await banco.compras.delete(compra.id);

      if (compra.situacao === "finalizada") {
        for (const produtoId of produtos) {
          await reconstruirResumoPreco(banco, {
            produtoId,
            supermercadoId: compra.supermercado_id,
          });
        }
      }
    },
  );
}
