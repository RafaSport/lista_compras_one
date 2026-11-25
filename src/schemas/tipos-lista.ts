import { z } from "zod";

// Cores disponíveis para as listas.
// O valor salvo é o nome; o hex fica no componente de UI.
export const coresLista = [
  "verde",
  "azul",
  "laranja",
  "roxo",
  "vermelho",
  "amarelo",
  "ciano",
  "rosa",
] as const;

export type CorLista = (typeof coresLista)[number];

// Validação do formulário de nova lista / edição.
export const esquemaTipoLista = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome da lista")
    .max(40, "O nome deve ter no máximo 40 caracteres"),
  cor: z.enum(coresLista, { message: "Escolha uma cor" }),
});

export type EntradaTipoLista = z.infer<typeof esquemaTipoLista>;