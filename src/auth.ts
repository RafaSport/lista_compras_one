import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/prisma";

// Campos que o formulário de login envia. O nome precisa bater com o que a
// tela usa em signIn("credentials", { ... }).
const credenciaisSchema = z.object({
  usuario: z.string().trim().min(1),
  senha: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  // A tela de login do projeto é /login.
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        usuario: { label: "Usuário", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credenciais) {
        const parsed = credenciaisSchema.safeParse(credenciais);

        if (!parsed.success) {
          return null;
        }

        const { usuario, senha } = parsed.data;

        // O login é gravado como nome.sobrenome. Normaliza para minúsculas
        // para o usuário não precisar acertar a caixa.
        const login = usuario.trim().toLowerCase();

        const encontrado = await prisma.usuario.findUnique({
          where: { login },
          select: { id: true, login: true, senhaHash: true },
        });

        if (!encontrado) {
          return null;
        }

        const senhaConfere = await bcrypt.compare(senha, encontrado.senhaHash);

        if (!senhaConfere) {
          return null;
        }

        return { id: encontrado.id, name: encontrado.login };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});