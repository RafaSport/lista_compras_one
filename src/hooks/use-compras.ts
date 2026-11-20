"use client";
/** Expõe compras reativas por usuário e operações do repositório de compras. */
import { abrirBanco } from "../local-db/abrir-banco";
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
  const banco = abrirBanco(usuarioId);
  const consulta = useConsultaReativa(async () => {
    const compras = await listarCompras(banco);
    return {
      compras,
      compra: compraId ? (compras.find((item) => item.id === compraId) ?? null) : null,
    };
  }, [banco, compraId]);

  return {
    carregando: consulta.carregando,
    erro: consulta.erro,
    dados: consulta.dados?.compras ?? [],
    compra: consulta.dados?.compra ?? null,
    criar: (entrada: NovaCompraLocal) => consulta.executar(() => criarCompra(banco, entrada)),
    fechar: (entrada: IdentificadorCompra) =>
      consulta.executar(() => fecharListaCompra(banco, entrada)),
    finalizar: (entrada: IdentificadorCompra) =>
      consulta.executar(() => finalizarCompra(banco, entrada)),
    excluir: (entrada: IdentificadorCompra) =>
      consulta.executar(() => excluirCompra(banco, entrada)),
  };
}
