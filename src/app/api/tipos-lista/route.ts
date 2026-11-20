import "server-only";

import { Prisma } from "@prisma/client";
import { tipoListaSchema } from "@/schemas/cadastros";
import { uuidSchema } from "@/schemas/comum";
import { prisma } from "@/server/prisma";
import { usuarioAtual } from "@/server/sessao";

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

    const tiposLista = await prisma.tipoLista.findMany({
      where: { usuarioId, ativo: true },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        usuarioId: true,
        nome: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return Response.json(
      tiposLista.map((tipoLista) => ({
        id: tipoLista.id,
        usuario_id: tipoLista.usuarioId,
        nome: tipoLista.nome,
        ativo: tipoLista.ativo,
        criado_em: tipoLista.criadoEm,
        atualizado_em: tipoLista.atualizadoEm,
      })),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json({ erro: "Não foi possível listar os tipos de lista." }, { status: 500 });
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
  const dados = tipoListaSchema.safeParse(corpo);
  if (!id || !dados.success) {
    return Response.json(
      { erro: "Cadastro inválido.", detalhes: dados.success ? undefined : dados.error.issues },
      { status: 400 },
    );
  }

  try {
    const tipoLista = await prisma.tipoLista.create({
      data: { id, usuarioId, nome: dados.data.nome },
      select: { id: true },
    });
    return Response.json(tipoLista, { status: 201 });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return Response.json({ erro: "Já existe um tipo de lista com esse nome." }, { status: 409 });
    }
    return Response.json({ erro: "Não foi possível criar o tipo de lista." }, { status: 500 });
  }
}
