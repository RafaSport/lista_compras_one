import { z } from "zod";
import { quantidadeSchema, textoOpcionalSchema, uuidSchema } from "./comum";
import { tipoMedidaSchema, unidadeSchema } from "./unidade";

export const supermercadoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(60, "Nome muito longo."),
});

export const tipoListaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(60, "Nome muito longo."),
});

export const produtoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(80, "Nome muito longo."),
  tipoMedida: tipoMedidaSchema,
});

export const itemListaSchema = z.object({
  tipoListaId: uuidSchema,
  produtoId: uuidSchema,
  quantidadePadrao: quantidadeSchema,
  unidadePadrao: unidadeSchema,
  marca: textoOpcionalSchema,
  observacao: textoOpcionalSchema,
});

export type SupermercadoEntrada = z.infer<typeof supermercadoSchema>;
export type TipoListaEntrada = z.infer<typeof tipoListaSchema>;
export type ProdutoEntrada = z.infer<typeof produtoSchema>;
export type ItemListaEntrada = z.infer<typeof itemListaSchema>;
