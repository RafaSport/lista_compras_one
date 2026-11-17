import { z } from "zod";
import { centavosSchema, quantidadeSchema, textoOpcionalSchema, uuidSchema } from "./comum";
import { situacaoCompraSchema, situacaoItemSchema } from "./compras";
import { tipoMedidaSchema, unidadeBaseSchema, unidadeSchema } from "./unidade";

// Payload de envio de uma compra finalizada (doc 04, seção 6.3).
// O id vem do aparelho e é o que garante idempotência no upsert.

export const supermercadoSincronizadoSchema = z.object({
  id: uuidSchema,
  nome: z.string().trim().min(1).max(60),
  ativo: z.boolean(),
  criadoEm: z.string().datetime(),
  atualizadoEm: z.string().datetime(),
});

export const tipoListaSincronizadoSchema = z.object({
  id: uuidSchema,
  nome: z.string().trim().min(1).max(60),
  ativo: z.boolean(),
  criadoEm: z.string().datetime(),
  atualizadoEm: z.string().datetime(),
});

export const produtoSincronizadoSchema = z.object({
  id: uuidSchema,
  nome: z.string().trim().min(1).max(80),
  tipoMedida: tipoMedidaSchema,
  ativo: z.boolean(),
  criadoEm: z.string().datetime(),
  atualizadoEm: z.string().datetime(),
});

export const itemCompraSincronizadoSchema = z.object({
  id: uuidSchema,
  produtoId: uuidSchema,
  situacao: situacaoItemSchema,
  quantidade: quantidadeSchema,
  embalagem: textoOpcionalSchema,
  conteudo: quantidadeSchema,
  unidade: unidadeSchema,
  marca: textoOpcionalSchema,
  observacao: textoOpcionalSchema,
  valorUnitario: centavosSchema.nullable(),
  valorItem: centavosSchema.nullable(),
  unidadeBase: unidadeBaseSchema.nullable(),
  precoUnidadeBase: z.number().nonnegative().nullable(),
  compradoEm: z.string().datetime().nullable(),
});

export const compraSincronizadaSchema = z.object({
  id: uuidSchema,
  supermercadoId: uuidSchema,
  tipoListaId: uuidSchema,
  situacao: situacaoCompraSchema,
  valorTotal: centavosSchema.nullable(),
  criadaEm: z.string().datetime(),
  fechadaEm: z.string().datetime().nullable(),
  finalizadaEm: z.string().datetime().nullable(),
  salvaEm: z.string().datetime().nullable(),
  atualizadoEm: z.string().datetime(),
});

export const envioCompraSchema = z.object({
  compra: compraSincronizadaSchema,
  itens: z.array(itemCompraSincronizadoSchema).min(1, "A compra precisa de ao menos um item."),
  supermercados: z.array(supermercadoSincronizadoSchema).default([]),
  tiposLista: z.array(tipoListaSincronizadoSchema).default([]),
  produtos: z.array(produtoSincronizadoSchema).default([]),
});

export type EnvioCompraEntrada = z.infer<typeof envioCompraSchema>;