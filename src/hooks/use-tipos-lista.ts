"use client";
/** Expõe leitura reativa e operações de tipos de lista pelo repositório local. */
import { abrirBanco } from "../local-db/abrir-banco";
import {
  atualizarTipoLista,
  criarTipoLista,
  excluirTipoLista,
  listarTiposLista,
} from "../local-db/repositories/tipos-lista";
import { uuidSchema } from "../schemas/comum";
import type { Atualizacao, DadosTipoLista, Identificador } from "../types/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useTiposLista(usuarioId: string) {
  const resultadoId = uuidSchema.safeParse(usuarioId);
  const banco = resultadoId.success ? abrirBanco(resultadoId.data) : null;
  const consulta = useConsultaReativa(
    () => (banco ? listarTiposLista(banco) : Promise.resolve([])),
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
    criar: (entrada: DadosTipoLista) =>
      consulta.executar(() => criarTipoLista(exigirBanco(), entrada)),
    atualizar: (entrada: Atualizacao<DadosTipoLista>) =>
      consulta.executar(() => atualizarTipoLista(exigirBanco(), entrada)),
    excluir: (entrada: Identificador) =>
      consulta.executar(() => excluirTipoLista(exigirBanco(), entrada)),
  };
}
