import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { cadastroSchema } from "@/schemas/senha";
import { gerarLogin } from "@/domain/gerar-login";

// Cria um usuário. Rota pública (RF21).
export async function POST(requisicao: Request) {
  const corpo = await requisicao.json().catch(() => null);
  const parsed = cadastroSchema.safeParse(corpo);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const { nome, sobrenome, senha } = parsed.data;

  const login = gerarLogin(nome, sobrenome);

  if (!login || login === ".") {
    return NextResponse.json({ erro: "Informe nome e sobrenome válidos." }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { login } });

  if (existente) {
    return NextResponse.json({ erro: "Login já existe.", login }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    await prisma.usuario.create({
      data: { nome, sobrenome, login, senhaHash },
    });
  } catch (erro) {
    // Só violação de unicidade é 409. Qualquer outro erro é falha do servidor
    // e precisa aparecer no log, em vez de virar "login já existe".
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return NextResponse.json({ erro: "Login já existe.", login }, { status: 409 });
    }

    console.error("Falha ao criar usuário:", erro);
    return NextResponse.json({ erro: "Não foi possível criar o usuário." }, { status: 500 });
  }

  return NextResponse.json({ login }, { status: 201 });
}
