import "server-only";

import { Prisma } from "@prisma/client";
import { produtoSchema } from "@/esquemas/cadastros";
import { uuidSchema } from "@/esquemas/comum";
import { prisma } from "@/servidor/prisma";
import { usuarioAtual } from "@/servidor/sessao";

type ContextoRota = { params: Promise<{ id: string }> };

export async function PATCH(requisicao: Request, { params }: ContextoRota): Promise<Response> {
  const usuarioId = await usuarioAtual();
  if (!usuarioId) {
    return Response.json({ erro: "Sessão não autenticada." }, { status: 401 });
  }

  const { id: idRecebido } = await params;
  const idValidado = uuidSchema.safeParse(idRecebido);
  if (!idValidado.success) {
    return Response.json({ erro: "Identificador inválido." }, { status: 400 });
  }

  let corpo: unknown;
  try {
    corpo = await requisicao.json();
  } catch {
    return Response.json({ erro: "O corpo precisa ser JSON válido." }, { status: 400 });
  }

  const dados = produtoSchema.partial().safeParse(corpo);
  if (!dados.success || Object.keys(dados.data ?? {}).length === 0) {
    return Response.json(
      {
        erro: "Dados de produto inválidos.",
        detalhes: dados.success ? undefined : dados.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const atualizado = await prisma.produto.updateMany({
      where: { id: idValidado.data, usuarioId },
      data: dados.data,
    });
    if (atualizado.count === 0) {
      return Response.json({ erro: "Produto não encontrado." }, { status: 404 });
    }
    return Response.json({ id: idValidado.data, atualizado: true });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return Response.json({ erro: "Já existe um produto com esse nome." }, { status: 409 });
    }
    return Response.json({ erro: "Não foi possível atualizar o produto." }, { status: 500 });
  }
}

export async function DELETE(_requisicao: Request, { params }: ContextoRota): Promise<Response> {
  const usuarioId = await usuarioAtual();
  if (!usuarioId) {
    return Response.json({ erro: "Sessão não autenticada." }, { status: 401 });
  }

  const { id: idRecebido } = await params;
  const idValidado = uuidSchema.safeParse(idRecebido);
  if (!idValidado.success) {
    return Response.json({ erro: "Identificador inválido." }, { status: 400 });
  }

  try {
    const resultado = await prisma.$transaction(
      async (transacao) => {
        const produto = await transacao.produto.findFirst({
          where: { id: idValidado.data, usuarioId },
          select: { id: true },
        });
        if (!produto) return null;

        const temHistorico =
          (await transacao.itemCompra.count({
            where: { produtoId: produto.id, compra: { is: { usuarioId } } },
          })) > 0;

        if (temHistorico) {
          await transacao.produto.updateMany({
            where: { id: produto.id, usuarioId },
            data: { ativo: false },
          });
          return "desativado" as const;
        }

        await transacao.itemLista.deleteMany({
          where: { produtoId: produto.id, tipoLista: { is: { usuarioId } } },
        });
        await transacao.produto.deleteMany({ where: { id: produto.id, usuarioId } });
        return "removido" as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (resultado === null) {
      return Response.json({ erro: "Produto não encontrado." }, { status: 404 });
    }
    return Response.json({ id: idValidado.data, resultado });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      (erro.code === "P2034" || erro.code === "P2003")
    ) {
      return Response.json({ erro: "Conflito ao excluir. Tente novamente." }, { status: 409 });
    }
    return Response.json({ erro: "Não foi possível excluir o produto." }, { status: 500 });
  }
}
