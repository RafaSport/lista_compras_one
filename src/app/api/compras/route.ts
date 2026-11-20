import "server-only";

import { Prisma } from "@prisma/client";
import { envioCompraSchema, type EnvioCompraEntrada } from "@/schemas/sincronizacao";
import { prisma } from "@/server/prisma";
import { usuarioAtual } from "@/server/sessao";

class ErroRegistroDeOutroUsuario extends Error {}

function validarIntegridadeDoEnvio(envio: EnvioCompraEntrada): string | null {
  const { compra, itens } = envio;

  if (compra.situacao !== "finalizada") {
    return "Somente compras finalizadas podem ser sincronizadas.";
  }

  if (compra.valorTotal === null || compra.finalizadaEm === null) {
    return "A compra finalizada precisa ter total e data de finalização.";
  }

  if (itens.some((item) => item.situacao !== "comprado")) {
    return "Todos os itens da compra precisam estar comprados.";
  }

  if (
    itens.some(
      (item) =>
        item.valorUnitario === null ||
        item.valorUnitario <= 0 ||
        item.valorItem === null ||
        item.unidadeBase === null ||
        item.precoUnidadeBase === null ||
        item.compradoEm === null,
    )
  ) {
    return "Cada item comprado precisa ter seus valores e data de compra.";
  }

  if (!envio.supermercados.some(({ id }) => id === compra.supermercadoId)) {
    return "O supermercado da compra não foi enviado.";
  }

  if (!envio.tiposLista.some(({ id }) => id === compra.tipoListaId)) {
    return "O tipo de lista da compra não foi enviado.";
  }

  const idsProdutos = new Set(envio.produtos.map(({ id }) => id));
  if (itens.some(({ produtoId }) => !idsProdutos.has(produtoId))) {
    return "Um ou mais produtos dos itens não foram enviados.";
  }

  if (new Set(itens.map(({ produtoId }) => produtoId)).size !== itens.length) {
    return "Um produto não pode aparecer mais de uma vez na compra.";
  }

  return null;
}

function converterData(data: string | null): Date | null {
  return data === null ? null : new Date(data);
}

function ehConflitoPrisma(erro: unknown): boolean {
  return (
    erro instanceof Prisma.PrismaClientKnownRequestError &&
    (erro.code === "P2002" || erro.code === "P2034")
  );
}

export async function GET(): Promise<Response> {
  try {
    const usuarioId = await usuarioAtual();

    if (!usuarioId) {
      return Response.json({ erro: "Sessão não autenticada." }, { status: 401 });
    }

    const compras = await prisma.compra.findMany({
      where: { usuarioId, situacao: "finalizada" },
      orderBy: { finalizadaEm: "desc" },
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
      },
    });

    return Response.json(
      compras.map((compra) => ({
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
      })),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json({ erro: "Não foi possível listar as compras." }, { status: 500 });
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
    return Response.json(
      { erro: "O corpo da requisição precisa ser JSON válido." },
      { status: 400 },
    );
  }

  const resultadoValidacao = envioCompraSchema.safeParse(corpo);
  if (!resultadoValidacao.success) {
    return Response.json(
      { erro: "Payload de sincronização inválido.", detalhes: resultadoValidacao.error.issues },
      { status: 400 },
    );
  }

  const envio = resultadoValidacao.data;
  const erroIntegridade = validarIntegridadeDoEnvio(envio);
  if (erroIntegridade) {
    return Response.json({ erro: erroIntegridade }, { status: 400 });
  }

  try {
    const foiCriada = await prisma.$transaction(
      async (transacao) => {
        const idsSupermercados = envio.supermercados.map(({ id }) => id);
        const idsTiposLista = envio.tiposLista.map(({ id }) => id);
        const idsProdutos = envio.produtos.map(({ id }) => id);

        const [compraExistente, supermercadosExistentes, tiposListaExistentes, produtosExistentes] =
          await Promise.all([
            transacao.compra.findUnique({
              where: { id: envio.compra.id },
              select: { usuarioId: true, salvaEm: true },
            }),
            transacao.supermercado.findMany({
              where: { id: { in: idsSupermercados } },
              select: { id: true, usuarioId: true },
            }),
            transacao.tipoLista.findMany({
              where: { id: { in: idsTiposLista } },
              select: { id: true, usuarioId: true },
            }),
            transacao.produto.findMany({
              where: { id: { in: idsProdutos } },
              select: { id: true, usuarioId: true },
            }),
          ]);

        if (compraExistente?.usuarioId !== undefined && compraExistente.usuarioId !== usuarioId) {
          throw new ErroRegistroDeOutroUsuario();
        }

        if (
          [...supermercadosExistentes, ...tiposListaExistentes, ...produtosExistentes].some(
            (registro) => registro.usuarioId !== usuarioId,
          )
        ) {
          throw new ErroRegistroDeOutroUsuario();
        }

        for (const supermercado of envio.supermercados) {
          await transacao.supermercado.upsert({
            where: { id: supermercado.id },
            create: {
              id: supermercado.id,
              usuarioId,
              nome: supermercado.nome,
              ativo: supermercado.ativo,
              criadoEm: new Date(supermercado.criadoEm),
              atualizadoEm: new Date(supermercado.atualizadoEm),
            },
            update: {
              nome: supermercado.nome,
              ativo: supermercado.ativo,
              atualizadoEm: new Date(supermercado.atualizadoEm),
            },
          });
        }

        for (const tipoLista of envio.tiposLista) {
          await transacao.tipoLista.upsert({
            where: { id: tipoLista.id },
            create: {
              id: tipoLista.id,
              usuarioId,
              nome: tipoLista.nome,
              ativo: tipoLista.ativo,
              criadoEm: new Date(tipoLista.criadoEm),
              atualizadoEm: new Date(tipoLista.atualizadoEm),
            },
            update: {
              nome: tipoLista.nome,
              ativo: tipoLista.ativo,
              atualizadoEm: new Date(tipoLista.atualizadoEm),
            },
          });
        }

        for (const produto of envio.produtos) {
          await transacao.produto.upsert({
            where: { id: produto.id },
            create: {
              id: produto.id,
              usuarioId,
              nome: produto.nome,
              tipoMedida: produto.tipoMedida,
              ativo: produto.ativo,
              criadoEm: new Date(produto.criadoEm),
              atualizadoEm: new Date(produto.atualizadoEm),
            },
            update: {
              nome: produto.nome,
              tipoMedida: produto.tipoMedida,
              ativo: produto.ativo,
              atualizadoEm: new Date(produto.atualizadoEm),
            },
          });
        }

        const salvaEm =
          compraExistente?.salvaEm ?? converterData(envio.compra.salvaEm) ?? new Date();
        await transacao.compra.upsert({
          where: { id: envio.compra.id },
          create: {
            id: envio.compra.id,
            usuarioId,
            supermercadoId: envio.compra.supermercadoId,
            tipoListaId: envio.compra.tipoListaId,
            situacao: envio.compra.situacao,
            valorTotal: envio.compra.valorTotal,
            criadaEm: new Date(envio.compra.criadaEm),
            fechadaEm: converterData(envio.compra.fechadaEm),
            finalizadaEm: converterData(envio.compra.finalizadaEm),
            salvaEm,
            atualizadoEm: new Date(envio.compra.atualizadoEm),
          },
          update: {
            supermercadoId: envio.compra.supermercadoId,
            tipoListaId: envio.compra.tipoListaId,
            situacao: envio.compra.situacao,
            valorTotal: envio.compra.valorTotal,
            criadaEm: new Date(envio.compra.criadaEm),
            fechadaEm: converterData(envio.compra.fechadaEm),
            finalizadaEm: converterData(envio.compra.finalizadaEm),
            salvaEm,
            atualizadoEm: new Date(envio.compra.atualizadoEm),
          },
        });

        await transacao.itemCompra.deleteMany({ where: { compraId: envio.compra.id } });
        await transacao.itemCompra.createMany({
          data: envio.itens.map((item) => ({
            id: item.id,
            compraId: envio.compra.id,
            produtoId: item.produtoId,
            situacao: item.situacao,
            quantidade: item.quantidade,
            embalagem: item.embalagem ?? null,
            conteudo: item.conteudo,
            unidade: item.unidade,
            marca: item.marca ?? null,
            observacao: item.observacao ?? null,
            valorUnitario: item.valorUnitario,
            valorItem: item.valorItem,
            unidadeBase: item.unidadeBase,
            precoUnidadeBase: item.precoUnidadeBase,
            compradoEm: converterData(item.compradoEm),
          })),
        });

        return compraExistente === null;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return Response.json(
      { sucesso: true, compraId: envio.compra.id, criada: foiCriada },
      { status: foiCriada ? 201 : 200, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (erro) {
    if (erro instanceof ErroRegistroDeOutroUsuario) {
      return Response.json({ erro: "Registro não encontrado." }, { status: 404 });
    }

    if (ehConflitoPrisma(erro)) {
      return Response.json(
        { erro: "Conflito ao sincronizar a compra. Tente novamente." },
        { status: 409 },
      );
    }

    return Response.json({ erro: "Não foi possível sincronizar a compra." }, { status: 500 });
  }
}
