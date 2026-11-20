import { z } from "zod";
import { centavosSchema, quantidadeSchema, textoOpcionalSchema, uuidSchema } from "./comum";
import { unidadeSchema } from "./unidade";

export const situacaoCompraSchema = z.enum(["em_montagem", "em_aberto", "finalizada"], {
  error: "Situação de compra inválida.",
});

export const situacaoItemSchema = z.enum(["pendente", "comprado"], {
  error: "Situação de item inválida.",
});

export const novaCompraSchema = z.object({
  supermercadoId: uuidSchema,
  tipoListaId: uuidSchema,
});

export const itemCompraEdicaoSchema = z.object({
  quantidade: quantidadeSchema,
  unidade: unidadeSchema,
  embalagem: textoOpcionalSchema,
  conteudo: quantidadeSchema,
  marca: textoOpcionalSchema,
  observacao: textoOpcionalSchema,
});

export const comprarItemSchema = z.object({
  itemId: uuidSchema,
  valorUnitario: centavosSchema.refine((valor) => valor > 0, {
    message: "Informe o preço do item.",
  }),
});

export type NovaCompraEntrada = z.infer<typeof novaCompraSchema>;
export type ItemCompraEdicaoEntrada = z.infer<typeof itemCompraEdicaoSchema>;
export type ComprarItemEntrada = z.infer<typeof comprarItemSchema>;
