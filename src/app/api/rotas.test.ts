import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const criarModelo = () => ({
    count: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
  });

  const prisma = {
    compra: criarModelo(),
    itemCompra: criarModelo(),
    itemLista: criarModelo(),
    produto: criarModelo(),
    supermercado: criarModelo(),
    tipoLista: criarModelo(),
    $transaction: vi.fn(),
  };

  return { prisma, usuarioAtual: vi.fn() };
});

vi.mock("server-only", () => ({}));
vi.mock("@/servidor/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/servidor/sessao", () => ({ usuarioAtual: mocks.usuarioAtual }));

import * as compras from "./compras/route";
import * as compraPorId from "./compras/[id]/route";
import * as produtos from "./produtos/route";
import * as produtoPorId from "./produtos/[id]/route";
import * as supermercados from "./supermercados/route";
import * as supermercadoPorId from "./supermercados/[id]/route";
import * as tiposLista from "./tipos-lista/route";
import * as tipoListaPorId from "./tipos-lista/[id]/route";

const usuarioA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const usuarioB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const idSupermercado = "10000000-0000-4000-8000-000000000001";
const idTipoLista = "20000000-0000-4000-8000-000000000001";
const idProduto = "30000000-0000-4000-8000-000000000001";
const idCompra = "40000000-0000-4000-8000-000000000001";
const idItem = "50000000-0000-4000-8000-000000000001";
const dataIso = "2026-01-01T12:00:00.000Z";

function requisicao(metodo: string, corpo?: unknown): Request {
  return new Request("http://localhost/api/teste", {
    method: metodo,
    headers: corpo === undefined ? undefined : { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
}

function contexto(id: string) {
  return { params: Promise.resolve({ id }) };
}

function configurarTransacao(): void {
  mocks.prisma.$transaction.mockImplementation(
    async (operacao: (transacao: unknown) => Promise<unknown>) => operacao(mocks.prisma),
  );
}

function limparMocks(): void {
  vi.resetAllMocks();
  mocks.usuarioAtual.mockResolvedValue(usuarioA);
  for (const modelo of [
    mocks.prisma.compra,
    mocks.prisma.itemCompra,
    mocks.prisma.itemLista,
    mocks.prisma.produto,
    mocks.prisma.supermercado,
    mocks.prisma.tipoLista,
  ]) {
    modelo.count.mockResolvedValue(0);
    modelo.create.mockResolvedValue({});
    modelo.createMany.mockResolvedValue({ count: 0 });
    modelo.deleteMany.mockResolvedValue({ count: 0 });
    modelo.findFirst.mockResolvedValue(null);
    modelo.findMany.mockResolvedValue([]);
    modelo.findUnique.mockResolvedValue(null);
    modelo.updateMany.mockResolvedValue({ count: 0 });
    modelo.upsert.mockResolvedValue({});
  }
  configurarTransacao();
}

beforeEach(limparMocks);

const handlersProtegidos: [string, () => Promise<Response>][] = [
  ["GET supermercados", () => supermercados.GET()],
  [
    "POST supermercados",
    () => supermercados.POST(requisicao("POST", { id: idSupermercado, nome: "Mercado" })),
  ],
  [
    "PATCH supermercado",
    () =>
      supermercadoPorId.PATCH(requisicao("PATCH", { nome: "Mercado" }), contexto(idSupermercado)),
  ],
  [
    "DELETE supermercado",
    () => supermercadoPorId.DELETE(requisicao("DELETE"), contexto(idSupermercado)),
  ],
  ["GET tipos de lista", () => tiposLista.GET()],
  [
    "POST tipos de lista",
    () => tiposLista.POST(requisicao("POST", { id: idTipoLista, nome: "Casa" })),
  ],
  [
    "PATCH tipo de lista",
    () => tipoListaPorId.PATCH(requisicao("PATCH", { nome: "Casa" }), contexto(idTipoLista)),
  ],
  [
    "DELETE tipo de lista",
    () => tipoListaPorId.DELETE(requisicao("DELETE"), contexto(idTipoLista)),
  ],
  ["GET produtos", () => produtos.GET()],
  [
    "POST produtos",
    () => produtos.POST(requisicao("POST", { id: idProduto, nome: "Arroz", tipoMedida: "peso" })),
  ],
  [
    "PATCH produto",
    () => produtoPorId.PATCH(requisicao("PATCH", { nome: "Arroz" }), contexto(idProduto)),
  ],
  ["DELETE produto", () => produtoPorId.DELETE(requisicao("DELETE"), contexto(idProduto))],
  ["GET compras", () => compras.GET()],
  ["POST compras", () => compras.POST(requisicao("POST", {}))],
  ["GET compra por id", () => compraPorId.GET(requisicao("GET"), contexto(idCompra))],
];

describe("rotas de API protegidas", () => {
  it.each(handlersProtegidos)("%s responde 401 sem sessão", async (_nome, executar) => {
    mocks.usuarioAtual.mockResolvedValue(null);

    const resposta = await executar();

    expect(resposta.status).toBe(401);
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("listagens de cadastros", () => {
  const cadastros = [
    {
      nome: "supermercados",
      consultar: () => supermercados.GET(),
      consulta: mocks.prisma.supermercado.findMany,
    },
    {
      nome: "tipos de lista",
      consultar: () => tiposLista.GET(),
      consulta: mocks.prisma.tipoLista.findMany,
    },
    {
      nome: "produtos",
      consultar: () => produtos.GET(),
      consulta: mocks.prisma.produto.findMany,
    },
  ];

  it.each(cadastros)(
    "$nome não devolve cadastros de outro usuário ou desativados",
    async ({ consultar, consulta }) => {
      const registros = [
        { id: idSupermercado, usuarioId: usuarioA, nome: "Ativo", ativo: true },
        { id: idTipoLista, usuarioId: usuarioA, nome: "Desativado", ativo: false },
        { id: idProduto, usuarioId: usuarioB, nome: "De outra pessoa", ativo: true },
      ];
      consulta.mockImplementation(
        async (argumentos: { where: { usuarioId: string; ativo: boolean } }) =>
          registros.filter(
            (registro) =>
              registro.usuarioId === argumentos.where.usuarioId &&
              registro.ativo === argumentos.where.ativo,
          ),
      );

      const resposta = await consultar();
      const resultado = (await resposta.json()) as Array<{ nome: string }>;

      expect(resposta.status).toBe(200);
      expect(consulta).toHaveBeenCalledWith(
        expect.objectContaining({ where: { usuarioId: usuarioA, ativo: true } }),
      );
      expect(resultado.map(({ nome }) => nome)).toEqual(["Ativo"]);
    },
  );
});

describe("acesso a compras", () => {
  it("lista apenas compras finalizadas do usuário autenticado", async () => {
    const registros = [
      { id: idCompra, usuarioId: usuarioA, situacao: "finalizada", valorTotal: 900 },
      { id: idItem, usuarioId: usuarioB, situacao: "finalizada", valorTotal: 100 },
      { id: idProduto, usuarioId: usuarioA, situacao: "em_aberto", valorTotal: null },
    ];
    mocks.prisma.compra.findMany.mockImplementation(
      async (argumentos: { where: { usuarioId: string; situacao: string } }) =>
        registros.filter(
          (registro) =>
            registro.usuarioId === argumentos.where.usuarioId &&
            registro.situacao === argumentos.where.situacao,
        ),
    );

    const resposta = await compras.GET();
    const resultado = (await resposta.json()) as Array<{ id: string }>;

    expect(resposta.status).toBe(200);
    expect(mocks.prisma.compra.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { usuarioId: usuarioA, situacao: "finalizada" } }),
    );
    expect(resultado.map(({ id }) => id)).toEqual([idCompra]);
  });

  it("não devolve compra de outro usuário ao consultar pelo id", async () => {
    mocks.prisma.compra.findFirst.mockResolvedValue(null);

    const resposta = await compraPorId.GET(requisicao("GET"), contexto(idCompra));

    expect(resposta.status).toBe(404);
    expect(mocks.prisma.compra.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: idCompra, usuarioId: usuarioA, situacao: "finalizada" },
      }),
    );
  });
});

describe("criação de cadastros", () => {
  const criacoes = [
    {
      nome: "supermercado",
      criar: () =>
        supermercados.POST(requisicao("POST", { id: idSupermercado, nome: "Mercado Central" })),
      operacao: mocks.prisma.supermercado.create,
      id: idSupermercado,
    },
    {
      nome: "tipo de lista",
      criar: () => tiposLista.POST(requisicao("POST", { id: idTipoLista, nome: "Alimentação" })),
      operacao: mocks.prisma.tipoLista.create,
      id: idTipoLista,
    },
    {
      nome: "produto",
      criar: () =>
        produtos.POST(requisicao("POST", { id: idProduto, nome: "Arroz", tipoMedida: "peso" })),
      operacao: mocks.prisma.produto.create,
      id: idProduto,
    },
  ];

  it.each(criacoes)(
    "cria $nome com o UUID do cliente e o usuário da sessão",
    async ({ criar, operacao, id }) => {
      operacao.mockResolvedValue({ id });

      const resposta = await criar();

      expect(resposta.status).toBe(201);
      expect(operacao).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ id, usuarioId: usuarioA }) }),
      );
    },
  );
});

describe("edição e exclusão por id", () => {
  const edicoes = [
    {
      nome: "supermercado",
      atualizar: () =>
        supermercadoPorId.PATCH(
          requisicao("PATCH", { nome: "Mercado novo" }),
          contexto(idSupermercado),
        ),
      excluir: () => supermercadoPorId.DELETE(requisicao("DELETE"), contexto(idSupermercado)),
      atualizacao: mocks.prisma.supermercado.updateMany,
      busca: mocks.prisma.supermercado.findFirst,
      id: idSupermercado,
    },
    {
      nome: "tipo de lista",
      atualizar: () =>
        tipoListaPorId.PATCH(requisicao("PATCH", { nome: "Nova lista" }), contexto(idTipoLista)),
      excluir: () => tipoListaPorId.DELETE(requisicao("DELETE"), contexto(idTipoLista)),
      atualizacao: mocks.prisma.tipoLista.updateMany,
      busca: mocks.prisma.tipoLista.findFirst,
      id: idTipoLista,
    },
    {
      nome: "produto",
      atualizar: () =>
        produtoPorId.PATCH(requisicao("PATCH", { nome: "Arroz novo" }), contexto(idProduto)),
      excluir: () => produtoPorId.DELETE(requisicao("DELETE"), contexto(idProduto)),
      atualizacao: mocks.prisma.produto.updateMany,
      busca: mocks.prisma.produto.findFirst,
      id: idProduto,
    },
  ];

  it.each(edicoes)("não altera $nome de outro usuário", async ({ atualizar, atualizacao, id }) => {
    atualizacao.mockResolvedValue({ count: 0 });

    const resposta = await atualizar();

    expect(resposta.status).toBe(404);
    expect(atualizacao).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id, usuarioId: usuarioA } }),
    );
  });

  it.each(edicoes)("não exclui $nome de outro usuário", async ({ excluir, busca, id }) => {
    busca.mockResolvedValue(null);

    const resposta = await excluir();

    expect(resposta.status).toBe(404);
    expect(busca).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id, usuarioId: usuarioA } }),
    );
  });
});

describe("exclusão com histórico", () => {
  const exclusoes = [
    {
      nome: "supermercado",
      excluir: () => supermercadoPorId.DELETE(requisicao("DELETE"), contexto(idSupermercado)),
      entidade: mocks.prisma.supermercado,
      contagem: mocks.prisma.compra.count,
      id: idSupermercado,
    },
    {
      nome: "tipo de lista",
      excluir: () => tipoListaPorId.DELETE(requisicao("DELETE"), contexto(idTipoLista)),
      entidade: mocks.prisma.tipoLista,
      contagem: mocks.prisma.compra.count,
      id: idTipoLista,
    },
    {
      nome: "produto",
      excluir: () => produtoPorId.DELETE(requisicao("DELETE"), contexto(idProduto)),
      entidade: mocks.prisma.produto,
      contagem: mocks.prisma.itemCompra.count,
      id: idProduto,
    },
  ];

  it.each(exclusoes)(
    "desativa $nome que tem histórico",
    async ({ excluir, entidade, contagem, id }) => {
      entidade.findFirst.mockResolvedValue({ id });
      contagem.mockResolvedValue(1);
      entidade.updateMany.mockResolvedValue({ count: 1 });

      const resposta = await excluir();
      const corpo = (await resposta.json()) as { resultado: string };

      expect(resposta.status).toBe(200);
      expect(corpo.resultado).toBe("desativado");
      expect(entidade.updateMany).toHaveBeenCalledWith({
        where: { id, usuarioId: usuarioA },
        data: { ativo: false },
      });
      expect(entidade.deleteMany).not.toHaveBeenCalled();
    },
  );
});

describe("exclusão sem histórico", () => {
  const exclusoes = [
    {
      nome: "supermercado",
      excluir: () => supermercadoPorId.DELETE(requisicao("DELETE"), contexto(idSupermercado)),
      entidade: mocks.prisma.supermercado,
      contagem: mocks.prisma.compra.count,
      id: idSupermercado,
    },
    {
      nome: "tipo de lista",
      excluir: () => tipoListaPorId.DELETE(requisicao("DELETE"), contexto(idTipoLista)),
      entidade: mocks.prisma.tipoLista,
      contagem: mocks.prisma.compra.count,
      id: idTipoLista,
    },
    {
      nome: "produto",
      excluir: () => produtoPorId.DELETE(requisicao("DELETE"), contexto(idProduto)),
      entidade: mocks.prisma.produto,
      contagem: mocks.prisma.itemCompra.count,
      id: idProduto,
    },
  ];

  it.each(exclusoes)(
    "remove fisicamente $nome sem histórico",
    async ({ excluir, entidade, contagem, id }) => {
      entidade.findFirst.mockResolvedValue({ id });
      contagem.mockResolvedValue(0);
      entidade.deleteMany.mockResolvedValue({ count: 1 });

      const resposta = await excluir();
      const corpo = (await resposta.json()) as { resultado: string };

      expect(resposta.status).toBe(200);
      expect(corpo.resultado).toBe("removido");
      expect(entidade.deleteMany).toHaveBeenCalledWith({ where: { id, usuarioId: usuarioA } });
    },
  );
});

describe("POST /api/compras idempotente", () => {
  const payload = {
    compra: {
      id: idCompra,
      supermercadoId: idSupermercado,
      tipoListaId: idTipoLista,
      situacao: "finalizada",
      valorTotal: 900,
      criadaEm: dataIso,
      fechadaEm: dataIso,
      finalizadaEm: dataIso,
      salvaEm: null,
      atualizadoEm: dataIso,
    },
    itens: [
      {
        id: idItem,
        produtoId: idProduto,
        situacao: "comprado",
        quantidade: 1,
        embalagem: undefined,
        conteudo: 1,
        unidade: "un",
        marca: undefined,
        observacao: undefined,
        valorUnitario: 900,
        valorItem: 900,
        unidadeBase: "un",
        precoUnidadeBase: 900,
        compradoEm: dataIso,
      },
    ],
    supermercados: [
      {
        id: idSupermercado,
        nome: "Mercado Central",
        ativo: true,
        criadoEm: dataIso,
        atualizadoEm: dataIso,
      },
    ],
    tiposLista: [
      {
        id: idTipoLista,
        nome: "Alimentação",
        ativo: true,
        criadoEm: dataIso,
        atualizadoEm: dataIso,
      },
    ],
    produtos: [
      {
        id: idProduto,
        nome: "Arroz",
        tipoMedida: "peso",
        ativo: true,
        criadoEm: dataIso,
        atualizadoEm: dataIso,
      },
    ],
  };

  it("envia duas vezes o mesmo id sem duplicar a compra ou seus itens", async () => {
    const bancoDeTeste: {
      compraSalva: { usuarioId: string; salvaEm: Date | null } | null;
      itensSalvos: unknown[];
    } = { compraSalva: null, itensSalvos: [] };
    mocks.prisma.compra.findUnique.mockImplementation(async () => bancoDeTeste.compraSalva);
    mocks.prisma.compra.upsert.mockImplementation(async (argumentos) => {
      bancoDeTeste.compraSalva ??= {
        usuarioId: argumentos.create.usuarioId,
        salvaEm: argumentos.create.salvaEm,
      };
      return bancoDeTeste.compraSalva;
    });
    mocks.prisma.itemCompra.deleteMany.mockImplementation(async () => {
      bancoDeTeste.itensSalvos = [];
      return { count: 0 };
    });
    mocks.prisma.itemCompra.createMany.mockImplementation(async (argumentos) => {
      bancoDeTeste.itensSalvos.push(...argumentos.data);
      return { count: argumentos.data.length };
    });

    const primeiraResposta = await compras.POST(requisicao("POST", payload));
    const segundaResposta = await compras.POST(requisicao("POST", payload));

    expect(primeiraResposta.status).toBe(201);
    expect(segundaResposta.status).toBe(200);
    expect(mocks.prisma.compra.upsert).toHaveBeenCalledTimes(2);
    expect(bancoDeTeste.compraSalva?.usuarioId).toBe(usuarioA);
    expect(bancoDeTeste.itensSalvos).toHaveLength(1);
  });

  it("recusa o id de uma compra que pertence a outro usuário", async () => {
    mocks.prisma.compra.findUnique.mockResolvedValue({ usuarioId: usuarioB, salvaEm: null });

    const resposta = await compras.POST(requisicao("POST", payload));

    expect(resposta.status).toBe(404);
    expect(mocks.prisma.compra.upsert).not.toHaveBeenCalled();
    expect(mocks.prisma.supermercado.upsert).not.toHaveBeenCalled();
  });
});
