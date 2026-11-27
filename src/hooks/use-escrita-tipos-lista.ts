"use client";

/**
 * Operações de escrita de tipos de lista, sem inscrição reativa.
 * O formulário usa este hook para não ficar inscrito no Dexie durante a navegação.
 */
import { useCallback, useState } from "react";
import { abrirBanco } from "../local-db/abrir-banco";
import {
  atualizarTipoLista,
  criarTipoLista,
} from "../local-db/repositories/tipos-lista";
import { uuidSchema } from "../schemas/comum";
import type { Atualizacao, DadosTipoLista } from "../types/banco-local";

export function useEscritaTiposLista(usuarioId: string) {
  const [erro, definirErro] = useState<string | null>(null);

  const exigirBanco = useCallback(() => {
    const resultado = uuidSchema.safeParse(usuarioId);
    if (!resultado.success) throw new Error("Identificador de usuário inválido.");
    return abrirBanco(resultado.data);
  }, [usuarioId]);

  const criar = useCallback(
    async (entrada: DadosTipoLista) => {
      definirErro(null);
      try {
        return await criarTipoLista(exigirBanco(), entrada);
      } catch (causa) {
        definirErro(
          causa instanceof Error ? causa.message : "Não foi possível salvar a lista.",
        );
        throw causa;
      }
    },
    [exigirBanco],
  );

  const atualizar = useCallback(
    async (entrada: Atualizacao<DadosTipoLista>) => {
      definirErro(null);
      try {
        return await atualizarTipoLista(exigirBanco(), entrada);
      } catch (causa) {
        definirErro(
          causa instanceof Error ? causa.message : "Não foi possível atualizar a lista.",
        );
        throw causa;
      }
    },
    [exigirBanco],
  );

  return { criar, atualizar, erro };
}