import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma 7 exige adapter na construção do client.
// A URL vem do prisma7.config.ts em tempo de CLI e do .env em runtime.

const globalParaPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function criarCliente(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não definida.");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Em desenvolvimento o hot reload recria o módulo. Guardar no global evita
// abrir uma conexão nova a cada alteração.
export const prisma = globalParaPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}