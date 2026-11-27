import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/prisma";
import { cadastroSchema } from "@/schemas/senha";

// Gera o login no formato nome.sobrenome, sem acentos e em minúsculas (RN12).
function gerarLogin(nome: string, sobrenome: string) {
  const limpar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  return `${limpar(nome)}.${limpar(sobrenome)}`;
}

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
  } catch {
    // Corrida: duas requisições com o mesmo login passaram pela consulta prévia.
    // O índice único do banco decide quem ganha.
    return NextResponse.json({ erro: "Login já existe.", login }, { status: 409 });
  }

  return NextResponse.json({ login }, { status: 201 });
}