import { z } from "zod";

export const uuidSchema = z.string().uuid("Identificador inválido.");

export const centavosSchema = z
  .number({ error: "Informe um valor em centavos." })
  .int("O valor deve ser inteiro em centavos.")
  .nonnegative("O valor não pode ser negativo.");

export const quantidadeSchema = z
  .number({ error: "Informe uma quantidade." })
  .positive("A quantidade deve ser maior que zero.");

export const textoOpcionalSchema = z
  .string()
  .trim()
  .max(200, "Use no máximo 200 caracteres.")
  .optional()
  .transform((valor) => (valor === "" ? undefined : valor));