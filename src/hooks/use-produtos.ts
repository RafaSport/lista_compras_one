"use client";
/** Expõe leitura reativa e operações de produtos pelo repositório local. */
import { abrirBanco } from "../local-db/abrir-banco";
import {
  atualizarProduto,
  criarProduto,
  excluirProduto,
  listarProdutos,
} from "../local-db/repositories/produtos";
import type { Atualizacao, DadosProduto, Identificador } from "../types/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useProdutos(usuarioId: string) {
  const banco = abrirBanco(usuarioId);
  const consulta = useConsultaReativa(() => listarProdutos(banco), [banco]);

  return {
    ...consulta,
    dados: consulta.dados ?? [],
    criar: (entrada: DadosProduto) => consulta.executar(() => criarProduto(banco, entrada)),
    atualizar: (entrada: Atualizacao<DadosProduto>) =>
      consulta.executar(() => atualizarProduto(banco, entrada)),
    excluir: (entrada: Identificador) => consulta.executar(() => excluirProduto(banco, entrada)),
  };
}
