"use client";
/** Expõe compras reativas por usuário e operações do repositório de compras. */
import { abrirBanco } from "../local-db/abrir-banco";
import { uuidSchema } from "../schemas/comum";
import {
  criarCompra,
  excluirCompra,
  fecharListaCompra,
  finalizarCompra,
  listarCompras,
} from "../local-db/repositories/compras";
import type { IdentificadorCompra, NovaCompraLocal } from "../types/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useCompras(usuarioId: string, compraId?: string) {
  const resultadoId = uuidSchema.safeParse(usuarioId);
  const idValido = resultadoId.success;

  // Só abre o banco quando o id é válido. Enquanto a sessão carrega,
  // devolvemos estado vazio em vez de lançar exceção.
  const banco = resultadoId.success ? abrirBanco(resultadoId.data) : null;

  const consulta = useConsultaReativa(async () => {
    if (!banco) {
      return { compras: [], compra: null };
    }

    const compras = await listarCompras(banco);
    return {
      compras,
      compra: compraId ? (compras.find((item) => item.id === compraId) ?? null) : null,
    };
  }, [banco, compraId]);

  // Operações de escrita exigem banco aberto. Se não houver, falha explícita
  // em vez de erro obscuro.
  function exigirBanco() {
    if (!banco) throw new Error("Sessão ainda não carregada.");
    return banco;
  }

  return {
    carregando: idValido ? consulta.carregando : false,
    erro: consulta.erro,
    dados: consulta.dados?.compras ?? [],
    compra: consulta.dados?.compra ?? null,
    criar: (entrada: NovaCompraLocal) =>
      consulta.executar(() => criarCompra(exigirBanco(), entrada)),
    fechar: (entrada: IdentificadorCompra) =>
      consulta.executar(() => fecharListaCompra(exigirBanco(), entrada)),
    finalizar: (entrada: IdentificadorCompra) =>
      consulta.executar(() => finalizarCompra(exigirBanco(), entrada)),
    excluir: (entrada: IdentificadorCompra) =>
      consulta.executar(() => excluirCompra(exigirBanco(), entrada)),
  };
}
