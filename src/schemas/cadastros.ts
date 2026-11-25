import { z } from "zod";
import { quantidadeSchema, textoOpcionalSchema, uuidSchema } from "./comum";
import { tipoMedidaSchema, unidadeSchema } from "./unidade";

/** Cores disponíveis para as listas. */
export const corListaSchema = z.enum([
  "verde",
  "azul",
  "laranja",
  "roxo",
  "vermelho",
  "amarelo",
  "ciano",
  "rosa",
]);

/** Validação do tipo de lista. A cor é opcional e assume "verde" quando omitida. */
export const tipoListaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome da lista.")
    .max(40, "Use no máximo 40 caracteres."),
  cor: corListaSchema.default("verde"),
});

export const supermercadoSchema = z.object({
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
