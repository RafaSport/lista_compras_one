"use client";
/** Expõe resumos reativos e comparação de preços pelo repositório local. */
import { abrirBanco } from "../banco-local/abrir-banco";
import {
  listarResumoPrecos,
  obterSupermercadoMaisEmConta,
} from "../banco-local/repositorios/resumo-precos";
import type { ComparacaoDePrecoProduto, ResumoPrecoComMedia } from "../tipos/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useResumoPrecos(
  usuarioId: string,
  produtoId: string,
  unidadeBase?: ComparacaoDePrecoProduto["unidadeBase"],
) {
  const banco = abrirBanco(usuarioId);
  const comparacao = unidadeBase ? { produtoId, unidadeBase } : null;
  const consulta = useConsultaReativa<ResumoPrecoComMedia[]>(
    () => listarResumoPrecos(banco, { produtoId }),
    [banco, produtoId],
  );
  const consultaMaisEmConta = useConsultaReativa<ResumoPrecoComMedia | null>(
    () => (comparacao ? obterSupermercadoMaisEmConta(banco, comparacao) : Promise.resolve(null)),
    [banco, produtoId, unidadeBase],
  );

  return {
    dados: consulta.dados ?? [],
    carregando: consulta.carregando || consultaMaisEmConta.carregando,
    erro: consulta.erro ?? consultaMaisEmConta.erro,
    maisEmConta: consultaMaisEmConta.dados ?? null,
  };
}
