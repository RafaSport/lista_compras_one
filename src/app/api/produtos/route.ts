import "server-only";

import { Prisma } from "@prisma/client";
import { produtoSchema } from "@/esquemas/cadastros";
import { uuidSchema } from "@/esquemas/comum";
import { prisma } from "@/servidor/prisma";
import { usuarioAtual } from "@/servidor/sessao";

function extrairId(corpo: unknown): string | null {
  if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) return null;
  const resultado = uuidSchema.safeParse((corpo as { id?: unknown }).id);
  return resultado.success ? resultado.data : null;
}

export async function GET(): Promise<Response> {
  try {
    const usuarioId = await usuarioAtual();

    if (!usuarioId) {
      return Response.json({ erro: "Sessão não autenticada." }, { status: 401 });
    }

    const produtos = await prisma.produto.findMany({
      where: { usuarioId, ativo: true },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        usuarioId: true,
        nome: true,
        tipoMedida: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return Response.json(
      produtos.map((produto) => ({
        id: produto.id,
        usuario_id: produto.usuarioId,
        nome: produto.nome,
        tipo_medida: produto.tipoMedida,
        ativo: produto.ativo,
        criado_em: produto.criadoEm,
        atualizado_em: produto.atualizadoEm,
      })),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json({ erro: "Não foi possível listar os produtos." }, { status: 500 });
  }
}

export async function POST(requisicao: Request): Promise<Response> {
  const usuarioId = await usuarioAtual();
  if (!usuarioId) {
    return Response.json({ erro: "Sessão não autenticada." }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await requisicao.json();
  } catch {
    return Response.json({ erro: "O corpo precisa ser JSON válido." }, { status: 400 });
  }

  const id = extrairId(corpo);
  const dados = produtoSchema.safeParse(corpo);
  if (!id || !dados.success) {
    return Response.json(
      { erro: "Cadastro inválido.", detalhes: dados.success ? undefined : dados.error.issues },
      { status: 400 },
    );
  }

  try {
    const produto = await prisma.produto.create({
      data: { id, usuarioId, nome: dados.data.nome, tipoMedida: dados.data.tipoMedida },
      select: { id: true },
    });
    return Response.json(produto, { status: 201 });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return Response.json({ erro: "Já existe um produto com esse nome." }, { status: 409 });
    }
    return Response.json({ erro: "Não foi possível criar o produto." }, { status: 500 });
  }
}
