"use client";
/** Centraliza leitura Dexie reativa e falhas de leitura ou escrita para as telas. */
import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

interface ResultadoConsulta<T> {
  dados: T | undefined;
  carregando: boolean;
  erro: string | null;
  executar: <TResultado>(operacao: () => Promise<TResultado>) => Promise<TResultado>;
}

/** Executa leituras reativas e preserva falhas de escrita sem engolir a rejeição. */
export function useConsultaReativa<T>(
  consulta: () => Promise<T>,
  dependencias: unknown[],
): ResultadoConsulta<T> {
  const [erroOperacao, definirErroOperacao] = useState<string | null>(null);
  const executar = useCallback(async <TResultado>(operacao: () => Promise<TResultado>) => {
    definirErroOperacao(null);
    try {
      return await operacao();
    } catch (erro) {
      definirErroOperacao(
        erro instanceof Error ? erro.message : "Não foi possível concluir a operação.",
      );
      throw erro;
    }
  }, []);
  const resultado = useLiveQuery(async () => {
    try {
      return { dados: await consulta(), erro: null };
    } catch (erro) {
      return {
        dados: undefined,
        erro: erro instanceof Error ? erro.message : "Não foi possível carregar os dados.",
      };
    }
  }, dependencias);

  return {
    dados: resultado?.dados,
    carregando: resultado === undefined,
    erro: resultado?.erro ?? erroOperacao,
    executar,
  };
}
