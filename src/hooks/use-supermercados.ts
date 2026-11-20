"use client";
/** Expõe leitura reativa e operações de supermercados pelo repositório local. */
import { abrirBanco } from "../local-db/abrir-banco";
import {
  atualizarSupermercado,
  criarSupermercado,
  excluirSupermercado,
  listarSupermercados,
} from "../local-db/repositories/supermercados";
import type { Atualizacao, DadosSupermercado, Identificador } from "../types/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useSupermercados(usuarioId: string) {
  const banco = abrirBanco(usuarioId);
  const consulta = useConsultaReativa(() => listarSupermercados(banco), [banco]);

  return {
    ...consulta,
    dados: consulta.dados ?? [],
    criar: (entrada: DadosSupermercado) =>
      consulta.executar(() => criarSupermercado(banco, entrada)),
    atualizar: (entrada: Atualizacao<DadosSupermercado>) =>
      consulta.executar(() => atualizarSupermercado(banco, entrada)),
    excluir: (entrada: Identificador) =>
      consulta.executar(() => excluirSupermercado(banco, entrada)),
  };
}
