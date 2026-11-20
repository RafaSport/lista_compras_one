"use client";
/** Expõe leitura reativa e operações de tipos de lista pelo repositório local. */
import { abrirBanco } from "../banco-local/abrir-banco";
import {
  atualizarTipoLista,
  criarTipoLista,
  excluirTipoLista,
  listarTiposLista,
} from "../banco-local/repositorios/tipos-lista";
import type { Atualizacao, DadosTipoLista, Identificador } from "../tipos/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useTiposLista(usuarioId: string) {
  const banco = abrirBanco(usuarioId);
  const consulta = useConsultaReativa(() => listarTiposLista(banco), [banco]);

  return {
    ...consulta,
    dados: consulta.dados ?? [],
    criar: (entrada: DadosTipoLista) => consulta.executar(() => criarTipoLista(banco, entrada)),
    atualizar: (entrada: Atualizacao<DadosTipoLista>) =>
      consulta.executar(() => atualizarTipoLista(banco, entrada)),
    excluir: (entrada: Identificador) => consulta.executar(() => excluirTipoLista(banco, entrada)),
  };
}
