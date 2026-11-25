import { z } from "zod";

// Validação do formulário de novo item da lista.
// Apenas a descrição é obrigatória; os demais campos são opcionais.
export const esquemaItemLista = z.object({
  descricao: z
    .string()
    .trim()
    .min(1, "Informe a descrição do item")
    .max(80, "A descrição deve ter no máximo 80 caracteres"),
  categoria: z.string().trim().max(40).optional().or(z.literal("")),
  observacao: z.string().trim().max(120).optional().or(z.literal("")),
  unidade: z.string().trim().max(10).optional().or(z.literal("")),
  quantidade_padrao: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (valor) => !valor || (!Number.isNaN(Number(valor)) && Number(valor) > 0),
      "Informe um número maior que zero",
    ),
});

export type EntradaItemLista = z.infer<typeof esquemaItemLista>;