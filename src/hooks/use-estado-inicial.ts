"use client";

import { useEffect, useRef } from "react";

/**
 * Executa a limpeza quando a página é desmontada.
 * Devolve o estado ao valor inicial ao sair da tela.
 */
export function useEstadoInicial(aoZerar: () => void) {
  const referencia = useRef(aoZerar);

  // Atualiza o ref dentro de um efeito, nunca durante o render.
  useEffect(() => {
    referencia.current = aoZerar;
  }, [aoZerar]);

  useEffect(() => {
    return () => {
      referencia.current();
    };
  }, []);
}