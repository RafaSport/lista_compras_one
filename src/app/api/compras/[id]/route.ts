import "server-only";

import { prisma } from "@/servidor/prisma";
import { usuarioAtual } from "@/servidor/sessao";

type ContextoRota = {
  params: Promise<{ id: string }>;
};

export async function GET(_requisicao: Request, { params }: ContextoRota): Promise<Response> {
  try {
    const usuarioId = await usuarioAtual();

    if (!usuarioId) {
      return Response.json({ erro: "Sessão não autenticada." }, { status: 401 });
    }

    const { id } = await params;
    const compra = await prisma.compra.findFirst({
      where: { id, usuarioId, situacao: "finalizada" },
      select: {
        id: true,
        usuarioId: true,
        supermercadoId: true,
        tipoListaId: true,
        situacao: true,
        valorTotal: true,
        criadaEm: true,
        fechadaEm: true,
        finalizadaEm: true,
        salvaEm: true,
        atualizadoEm: true,
        itens: {
          orderBy: { criadoEm: "asc" },
          select: {
            id: true,
            compraId: true,
            produtoId: true,
            situacao: true,
            quantidade: true,
            embalagem: true,
            conteudo: true,
            unidade: true,
            marca: true,
            observacao: true,
            valorUnitario: true,
            valorItem: true,
            unidadeBase: true,
            precoUnidadeBase: true,
            compradoEm: true,
            criadoEm: true,
            atualizadoEm: true,
          },
        },
      },
    });

    if (!compra) {
      return Response.json({ erro: "Compra não encontrada." }, { status: 404 });
    }

    return Response.json(
      {
        id: compra.id,
        usuario_id: compra.usuarioId,
        supermercado_id: compra.supermercadoId,
        tipo_lista_id: compra.tipoListaId,
        situacao: compra.situacao,
        valor_total: compra.valorTotal,
        criada_em: compra.criadaEm,
        fechada_em: compra.fechadaEm,
        finalizada_em: compra.finalizadaEm,
        salva_em: compra.salvaEm,
        atualizado_em: compra.atualizadoEm,
        itens_compra: compra.itens.map((item) => ({
          id: item.id,
          compra_id: item.compraId,
          produto_id: item.produtoId,
          situacao: item.situacao,
          quantidade: item.quantidade.toNumber(),
          embalagem: item.embalagem,
          conteudo: item.conteudo.toNumber(),
          unidade: item.unidade,
          marca: item.marca,
          observacao: item.observacao,
          valor_unitario: item.valorUnitario,
          valor_item: item.valorItem,
          unidade_base: item.unidadeBase,
          preco_unidade_base: item.precoUnidadeBase?.toNumber() ?? null,
          comprado_em: item.compradoEm,
          criado_em: item.criadoEm,
          atualizado_em: item.atualizadoEm,
        })),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json({ erro: "Não foi possível consultar a compra." }, { status: 500 });
  }
}
