"use client";
/** Expõe leitura reativa e operações de supermercados pelo repositório local. */
import { abrirBanco } from "../local-db/abrir-banco";
import {
  atualizarSupermercado,
  criarSupermercado,
  excluirSupermercado,
  listarSupermercados,
} from "../local-db/repositories/supermercados";
import { uuidSchema } from "../schemas/comum";
import type { Atualizacao, DadosSupermercado, Identificador } from "../types/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useSupermercados(usuarioId: string) {
  const resultadoId = uuidSchema.safeParse(usuarioId);
  const banco = resultadoId.success ? abrirBanco(resultadoId.data) : null;
  const consulta = useConsultaReativa(
    () => (banco ? listarSupermercados(banco) : Promise.resolve([])),
    [banco],
  );

  function exigirBanco() {
    if (!banco) throw new Error("Identificador de usuário inválido.");
    return banco;
  }

  return {
    ...consulta,
    carregando: resultadoId.success ? consulta.carregando : false,
    dados: consulta.dados ?? [],
    criar: (entrada: DadosSupermercado) =>
      consulta.executar(() => criarSupermercado(exigirBanco(), entrada)),
    atualizar: (entrada: Atualizacao<DadosSupermercado>) =>
      consulta.executar(() => atualizarSupermercado(exigirBanco(), entrada)),
    excluir: (entrada: Identificador) =>
      consulta.executar(() => excluirSupermercado(exigirBanco(), entrada)),
  };
}
