"use client";
/** Expõe itens padrão de um tipo de lista e suas operações de repositório. */
import { abrirBanco } from "../banco-local/abrir-banco";
import { listarProdutos } from "../banco-local/repositorios/produtos";
import {
  atualizarItemLista,
  criarItemLista,
  excluirItemLista,
  listarItensLista,
} from "../banco-local/repositorios/itens-lista";
import { listarTiposLista } from "../banco-local/repositorios/tipos-lista";
import type { Atualizacao, DadosItemLista, Identificador } from "../tipos/banco-local";
import { useConsultaReativa } from "./use-consulta-reativa";

export function useItensLista(usuarioId: string, tipoListaId: string) {
  const banco = abrirBanco(usuarioId);
  const consulta = useConsultaReativa(async () => {
    const [itens, produtos, tipos] = await Promise.all([
      listarItensLista(banco, { tipoListaId }),
      listarProdutos(banco),
      listarTiposLista(banco),
    ]);
    const produtosAtivos = new Set(produtos.map((produto) => produto.id));
    const tipoAtivo = tipos.some((tipo) => tipo.id === tipoListaId);
    return tipoAtivo ? itens.filter((item) => produtosAtivos.has(item.produto_id)) : [];
  }, [banco, tipoListaId]);

  return {
    ...consulta,
    dados: consulta.dados ?? [],
    criar: (entrada: DadosItemLista) => consulta.executar(() => criarItemLista(banco, entrada)),
    atualizar: (entrada: Atualizacao<DadosItemLista>) =>
      consulta.executar(() => atualizarItemLista(banco, entrada)),
    excluir: (entrada: Identificador) => consulta.executar(() => excluirItemLista(banco, entrada)),
  };
}
