import "server-only";
import { auth } from "@/auth";
import { prisma } from "./prisma";

// Toda rota de API e Server Action passa por aqui.
// Devolve o usuarioId ou null — nunca lança, para o chamador decidir o 401.

export async function usuarioAtual(): Promise<string | null> {
  const sessao = await auth();
  return sessao?.user?.id ?? null;
}

export async function exigirUsuario(): Promise<string> {
  const usuarioId = await usuarioAtual();

  if (!usuarioId) {
    throw new ErroNaoAutenticado();
  }

  return usuarioId;
}

export class ErroNaoAutenticado extends Error {
  constructor() {
    super("Sessão expirada ou inexistente.");
    this.name = "ErroNaoAutenticado";
  }
}

// Confirma que o registro pertence ao usuário logado antes de qualquer
// leitura ou escrita. Cadastro de outro usuário é tratado como inexistente.
export async function exigirDonoDoSupermercado(
  usuarioId: string,
  supermercadoId: string,
): Promise<void> {
  const encontrado = await prisma.supermercado.findFirst({
    where: { id: supermercadoId, usuarioId },
    select: { id: true },
  });

  if (!encontrado) {
    throw new ErroNaoEncontrado("Supermercado não encontrado.");
  }
}

export async function exigirDonoDoTipoLista(usuarioId: string, tipoListaId: string): Promise<void> {
  const encontrado = await prisma.tipoLista.findFirst({
    where: { id: tipoListaId, usuarioId },
    select: { id: true },
  });

  if (!encontrado) {
    throw new ErroNaoEncontrado("Tipo de lista não encontrado.");
  }
}

export async function exigirDonoDoProduto(usuarioId: string, produtoId: string): Promise<void> {
  const encontrado = await prisma.produto.findFirst({
    where: { id: produtoId, usuarioId },
    select: { id: true },
  });

  if (!encontrado) {
    throw new ErroNaoEncontrado("Produto não encontrado.");
  }
}

export class ErroNaoEncontrado extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroNaoEncontrado";
  }
}
