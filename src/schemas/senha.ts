import { z } from "zod";

export const senhaSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .max(64, "A senha deve ter no máximo 64 caracteres.")
  .regex(/[A-Za-zÀ-ÿ]/, "A senha deve conter ao menos uma letra.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.");

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome.").max(40, "Nome muito longo."),
    sobrenome: z.string().trim().min(2, "Informe o sobrenome.").max(60, "Sobrenome muito longo."),
    senha: senhaSchema,
    confirmacaoSenha: z.string(),
    codigoConvite: z.string().min(1, "Informe o código de convite."),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: "As senhas não são iguais.",
    path: ["confirmacaoSenha"],
  });

export const loginSchema = z.object({
  login: z.string().trim().min(1, "Informe o login."),
  senha: z.string().min(1, "Informe a senha."),
});

export type CadastroEntrada = z.infer<typeof cadastroSchema>;
export type LoginEntrada = z.infer<typeof loginSchema>;
