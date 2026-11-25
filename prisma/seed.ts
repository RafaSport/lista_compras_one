import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// O seed roda fora do Next.js, então não pode importar src/server/prisma.ts
// (ele usa "server-only"). Monta o próprio cliente com o driver adapter,
// que é obrigatório no Prisma 7.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Cria um usuário de teste para validar o login.
// Login: rafael.guedes — Senha: 123456
async function main() {
  const login = "rafael.guedes";

  const existente = await prisma.usuario.findUnique({ where: { login } });

  if (existente) {
    console.log(`Usuário ${login} já existe. Nada a fazer.`);
    return;
  }

  const senhaHash = await bcrypt.hash("123456", 10);

  await prisma.usuario.create({
    data: {
      nome: "Rafael",
      sobrenome: "Guedes",
      login,
      senhaHash,
    },
  });

  console.log(`Usuário criado: ${login} / senha: 123456`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());