"use client";
/** Expõe itens de uma compra com leitura reativa e escrita pelo repositório. */
import { abrirBanco } from "../local-db/abrir-banco";
import {
  adicionarItemCompra,
  atualizarItemCompra,
  comprarItem,
  desfazerCompraItem,
  excluirItemCompra,
  listarItensCompra,
} from "../local-db/repositories/itens-compra";
import type {
  Atualizacao,
  CompraDeItem,
  DadosItemCompra,
  IdentificadorItemCompra,
  NovoItemCompra,
} from "../types/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useItensCompra(usuarioId: string, compraId: string) {
  const banco = abrirBanco(usuarioId);
  const consulta = useConsultaReativa(
    () => listarItensCompra(banco, { compraId }),
    [banco, compraId],
  );

  return {
    ...consulta,
    dados: consulta.dados ?? [],
    adicionar: (entrada: NovoItemCompra) =>
      consulta.executar(() => adicionarItemCompra(banco, entrada)),
    atualizar: (entrada: Atualizacao<DadosItemCompra>) =>
      consulta.executar(() => atualizarItemCompra(banco, entrada)),
    comprar: (entrada: CompraDeItem) => consulta.executar(() => comprarItem(banco, entrada)),
    desfazer: (entrada: IdentificadorItemCompra) =>
      consulta.executar(() => desfazerCompraItem(banco, entrada)),
    excluir: (entrada: IdentificadorItemCompra) =>
      consulta.executar(() => excluirItemCompra(banco, entrada)),
  };
}
