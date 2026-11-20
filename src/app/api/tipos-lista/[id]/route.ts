import "server-only";

import { Prisma } from "@prisma/client";
import { tipoListaSchema } from "@/schemas/cadastros";
import { uuidSchema } from "@/schemas/comum";
import { prisma } from "@/server/prisma";
import { usuarioAtual } from "@/server/sessao";

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

  const dados = tipoListaSchema.partial().safeParse(corpo);
  if (!dados.success || Object.keys(dados.data ?? {}).length === 0) {
    return Response.json(
      {
        erro: "Dados de tipo de lista inválidos.",
        detalhes: dados.success ? undefined : dados.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const atualizado = await prisma.tipoLista.updateMany({
      where: { id: idValidado.data, usuarioId },
      data: dados.data,
    });
    if (atualizado.count === 0) {
      return Response.json({ erro: "Tipo de lista não encontrado." }, { status: 404 });
    }
    return Response.json({ id: idValidado.data, atualizado: true });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return Response.json({ erro: "Já existe um tipo de lista com esse nome." }, { status: 409 });
    }
    return Response.json({ erro: "Não foi possível atualizar o tipo de lista." }, { status: 500 });
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
        const tipoLista = await transacao.tipoLista.findFirst({
          where: { id: idValidado.data, usuarioId },
          select: { id: true },
        });
        if (!tipoLista) return null;

        const temHistorico =
          (await transacao.compra.count({ where: { tipoListaId: tipoLista.id, usuarioId } })) > 0;

        if (temHistorico) {
          await transacao.tipoLista.updateMany({
            where: { id: tipoLista.id, usuarioId },
            data: { ativo: false },
          });
          return "desativado" as const;
        }

        await transacao.tipoLista.deleteMany({ where: { id: tipoLista.id, usuarioId } });
        return "removido" as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (resultado === null) {
      return Response.json({ erro: "Tipo de lista não encontrado." }, { status: 404 });
    }
    return Response.json({ id: idValidado.data, resultado });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      (erro.code === "P2034" || erro.code === "P2003")
    ) {
      return Response.json({ erro: "Conflito ao excluir. Tente novamente." }, { status: 409 });
    }
    return Response.json({ erro: "Não foi possível excluir o tipo de lista." }, { status: 500 });
  }
}
