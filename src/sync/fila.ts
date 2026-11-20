/** Envia compras finalizadas pela fila local de sincronização. */
import { envioCompraSchema, type EnvioCompraEntrada } from "../schemas/sincronizacao";
import type { BancoLocal } from "../local-db/esquema";
import type {
  Compra,
  IdentificadorCompra,
  OperacaoSincronizacao,
  ResultadoFila,
} from "../types/banco-local";
import { atualizarControleSincronizacao, novoControleSincronizacao } from "../local-db/controle";

export type EnviadorCompra = (payload: EnvioCompraEntrada) => Promise<void>;

/** Enfileira uma compra finalizada uma única vez, usando seu UUID como chave idempotente. */
export async function enfileirarCompra(
  banco: BancoLocal,
  entrada: IdentificadorCompra,
): Promise<OperacaoSincronizacao> {
  const compra = await banco.compras.get(entrada.compraId);
  if (!compra || compra.situacao !== "finalizada") {
    throw new Error("Somente compras finalizadas podem entrar na fila.");
  }

  const existente = await banco.fila_sincronizacao.where("compra_id").equals(compra.id).first();
  if (existente) return existente;

  const agora = new Date().toISOString();
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
  return operacao;
}

/** Monta e valida o payload de compra sem enviar campos internos do IndexedDB. */
export async function montarPayloadCompra(
  banco: BancoLocal,
  entrada: IdentificadorCompra,
): Promise<EnvioCompraEntrada> {
  const compra = await banco.compras.get(entrada.compraId);
  if (!compra || compra.situacao !== "finalizada") {
    throw new Error("Somente compras finalizadas podem ser sincronizadas.");
  }
  const [supermercado, tipoLista, itens] = await Promise.all([
    banco.supermercados.get(compra.supermercado_id),
    banco.tipos_lista.get(compra.tipo_lista_id),
    banco.itens_compra.where("compra_id").equals(compra.id).toArray(),
  ]);
  if (!supermercado || !tipoLista) throw new Error("Cadastro usado pela compra não encontrado.");
  const itensComprados = itens.filter((item) => item.situacao === "comprado");
  const produtos = await Promise.all(
    [...new Set(itensComprados.map((item) => item.produto_id))].map((id) => banco.produtos.get(id)),
  );
  if (produtos.some((produto) => !produto))
    throw new Error("Produto usado pela compra não encontrado.");

  return envioCompraSchema.parse({
    compra: {
      id: compra.id,
      supermercadoId: compra.supermercado_id,
      tipoListaId: compra.tipo_lista_id,
      situacao: compra.situacao,
      valorTotal: compra.valor_total,
      criadaEm: compra.criada_em,
      fechadaEm: compra.fechada_em,
      finalizadaEm: compra.finalizada_em,
      salvaEm: compra.salva_em,
      atualizadoEm: compra.atualizado_em,
    },
    itens: itensComprados.map((item) => ({
      id: item.id,
      produtoId: item.produto_id,
      situacao: item.situacao,
      quantidade: item.quantidade,
      embalagem: item.embalagem,
      conteudo: item.conteudo,
      unidade: item.unidade,
      marca: item.marca,
      observacao: item.observacao,
      valorUnitario: item.valor_unitario,
      valorItem: item.valor_item,
      unidadeBase: item.unidade_base,
      precoUnidadeBase: item.preco_unidade_base,
      compradoEm: item.comprado_em,
    })),
    supermercados: [
      {
        id: supermercado.id,
        nome: supermercado.nome,
        ativo: supermercado.ativo,
        criadoEm: supermercado.criado_em,
        atualizadoEm: supermercado.atualizado_em,
      },
    ],
    tiposLista: [
      {
        id: tipoLista.id,
        nome: tipoLista.nome,
        ativo: tipoLista.ativo,
        criadoEm: tipoLista.criado_em,
        atualizadoEm: tipoLista.atualizado_em,
      },
    ],
    produtos: produtos.map((produto) => ({
      id: produto!.id,
      nome: produto!.nome,
      tipoMedida: produto!.tipo_medida,
      ativo: produto!.ativo,
      criadoEm: produto!.criado_em,
      atualizadoEm: produto!.atualizado_em,
    })),
  });
}

async function enviarPorHttp(payload: EnvioCompraEntrada): Promise<void> {
  const resposta = await fetch("/api/compras", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resposta.ok) throw new Error(`Falha no envio da compra (HTTP ${resposta.status}).`);
}

/** Envia pendências em ordem, mantém falhas na fila e continua com as operações seguintes. */
export async function processarFilaSincronizacao(
  banco: BancoLocal,
  enviar: EnviadorCompra = enviarPorHttp,
): Promise<ResultadoFila> {
  const pendentes = await banco.fila_sincronizacao
    .where("estado")
    .equals("pendente")
    .sortBy("criada_em");
  const resultado: ResultadoFila = { enviadas: 0, falhas: 0 };

  for (const operacao of pendentes) {
    const agora = new Date().toISOString();
    const compra = await banco.compras.get(operacao.compra_id);
    if (!compra || compra.salva_em) {
      await banco.fila_sincronizacao.put({
        ...operacao,
        estado: "concluida",
        ...atualizarControleSincronizacao(operacao, agora, "sincronizado"),
      });
      continue;
    }

    try {
      const payload = await montarPayloadCompra(banco, { compraId: compra.id });
      await enviar(payload);
      await banco.transaction("rw", banco.compras, banco.fila_sincronizacao, async () => {
        const salvaEm = new Date().toISOString();
        const atualCompra = await banco.compras.get(compra.id);
        const atualOperacao = await banco.fila_sincronizacao.get(operacao.id);
        if (atualCompra && !atualCompra.salva_em) {
          const atualizado: Compra = {
            ...atualCompra,
            salva_em: salvaEm,
            ...atualizarControleSincronizacao(atualCompra, salvaEm, "sincronizado"),
          };
          await banco.compras.put(atualizado);
        }
        if (atualOperacao) {
          await banco.fila_sincronizacao.put({
            ...atualOperacao,
            estado: "concluida",
            ultimo_erro: null,
            ...atualizarControleSincronizacao(atualOperacao, salvaEm, "sincronizado"),
          });
        }
      });
      resultado.enviadas += 1;
    } catch (erro) {
      const falhouEm = new Date().toISOString();
      const mensagem = erro instanceof Error ? erro.message : "Falha desconhecida no envio.";
      await banco.fila_sincronizacao.put({
        ...operacao,
        estado: "pendente",
        tentativas: operacao.tentativas + 1,
        ultimo_erro: mensagem,
        ...atualizarControleSincronizacao(operacao, falhouEm),
      });
      resultado.falhas += 1;
    }
  }

  return resultado;
}
