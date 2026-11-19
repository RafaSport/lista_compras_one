/** Mantém o cache de preços derivado do histórico local. */
import { calcularUltimoEMedia } from "../../dominio/calcular-ultimo-e-media";
import { compararSupermercados } from "../../dominio/comparar-supermercados";
import type {
  ComparacaoDePrecoProduto,
  ItensPorProduto,
  ItemCompra,
  PrecoDoProdutoNoSupermercado,
  ResumoPreco,
} from "../../tipos/banco-local";
import { atualizarControleSincronizacao, novoControleSincronizacao } from "../controle";
import type { BancoLocal } from "../esquema";

async function lerHistoricoFinalizado(
  banco: BancoLocal,
  entrada: PrecoDoProdutoNoSupermercado,
): Promise<ItemCompra[]> {
  const [itens, compras] = await Promise.all([
    banco.itens_compra.where("produto_id").equals(entrada.produtoId).toArray(),
    banco.compras.toArray(),
  ]);
  const comprasDoSupermercado = new Set(
    compras
      .filter(
        (compra) =>
          compra.situacao === "finalizada" && compra.supermercado_id === entrada.supermercadoId,
      )
      .map((compra) => compra.id),
  );
  return itens.filter(
    (item) =>
      item.situacao === "comprado" &&
      item.preco_unidade_base !== null &&
      item.comprado_em !== null &&
      comprasDoSupermercado.has(item.compra_id),
  );
}

/** Repositório do cache de preços, reconstruível a partir de compras finalizadas (RN02, RN03). */
export async function reconstruirResumoPreco(
  banco: BancoLocal,
  entrada: PrecoDoProdutoNoSupermercado,
): Promise<ResumoPreco | undefined> {
  return banco.transaction(
    "rw",
    [banco.itens_compra, banco.compras, banco.resumo_precos, banco.produtos],
    async () => {
      const itensValidos = await lerHistoricoFinalizado(banco, entrada);
      if (itensValidos.length === 0) {
        await banco.resumo_precos.delete([entrada.produtoId, entrada.supermercadoId]);
        return undefined;
      }

      const historico = itensValidos.map((item) => ({
        precoUnidadeBase: item.preco_unidade_base!,
        compradoEm: new Date(item.comprado_em!),
      }));
      const calculo = calcularUltimoEMedia(historico);
      if (!calculo) return undefined;

      const atual = await banco.resumo_precos.get([entrada.produtoId, entrada.supermercadoId]);
      const maisRecente = itensValidos.reduce((maisNovo, item) =>
        item.comprado_em! > maisNovo.comprado_em! ? item : maisNovo,
      );
      const somaPrecos = itensValidos.reduce((soma, item) => soma + item.preco_unidade_base!, 0);
      const produto = await banco.produtos.get(entrada.produtoId);
      if (!produto) throw new Error("Produto do histórico não encontrado.");
      const agora = new Date().toISOString();
      const resumo: ResumoPreco = {
        produto_id: entrada.produtoId,
        supermercado_id: entrada.supermercadoId,
        unidade_base:
          produto.tipo_medida === "volume" ? "L" : produto.tipo_medida === "peso" ? "kg" : "un",
        ultimo_valor: calculo.ultimoValor,
        ultima_compra_em: maisRecente.comprado_em!,
        soma_precos: somaPrecos,
        quantidade_compras: itensValidos.length,
        excluido_em: atual?.excluido_em ?? null,
        ...(atual
          ? atualizarControleSincronizacao(atual, agora)
          : novoControleSincronizacao(agora)),
      };
      await banco.resumo_precos.put(resumo);
      return resumo;
    },
  );
}

export async function listarResumoPrecos(
  banco: BancoLocal,
  entrada: ItensPorProduto,
): Promise<ResumoPreco[]> {
  return banco.resumo_precos.where("produto_id").equals(entrada.produtoId).toArray();
}

export async function obterSupermercadoMaisEmConta(
  banco: BancoLocal,
  entrada: ComparacaoDePrecoProduto,
): Promise<ResumoPreco | null> {
  const resumos = await listarResumoPrecos(banco, { produtoId: entrada.produtoId });
  const comparaveis = resumos.filter((resumo) => resumo.unidade_base === entrada.unidadeBase);
  const precos = await Promise.all(
    comparaveis.map(async (resumo) => {
      const itens = await lerHistoricoFinalizado(banco, {
        produtoId: resumo.produto_id,
        supermercadoId: resumo.supermercado_id,
      });
      const calculo = calcularUltimoEMedia(
        itens.map((item) => ({
          precoUnidadeBase: item.preco_unidade_base!,
          compradoEm: new Date(item.comprado_em!),
        })),
      );
      return calculo
        ? { supermercadoId: resumo.supermercado_id, valorMedio: calculo.valorMedio }
        : null;
    }),
  );
  const escolhido = compararSupermercados(
    precos.filter((preco): preco is NonNullable<typeof preco> => preco !== null),
  );
  return comparaveis.find((resumo) => resumo.supermercado_id === escolhido?.supermercadoId) ?? null;
}
