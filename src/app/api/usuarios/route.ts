import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/prisma";

// Valida o corpo do cadastro. O login é derivado de nome + sobrenome (RN12).
const corpoSchema = z.object({
  nome: z.string().trim().min(1),
  sobrenome: z.string().trim().min(1),
  senha: z.string().min(6),
});

// Gera o login no formato nome.sobrenome, sem acentos e em minúsculas.
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
  const parsed = corpoSchema.safeParse(corpo);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const { nome, sobrenome, senha } = parsed.data;
  const login = gerarLogin(nome, sobrenome);

  // Login vazio acontece se nome ou sobrenome não tiver letras.
  if (!login || login === ".") {
    return NextResponse.json({ erro: "Informe nome e sobrenome válidos." }, { status: 400 });
  }

  // Se o login já existe, responde 409 para a tela pedir outro sobrenome.
  const existente = await prisma.usuario.findUnique({ where: { login } });

  if (existente) {
    return NextResponse.json({ erro: "Login já existe.", login }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  // O schema exige nome e sobrenome, então gravamos os três campos.
  await prisma.usuario.create({
    data: { nome, sobrenome, login, senhaHash },
  });

  return NextResponse.json({ login }, { status: 201 });
}