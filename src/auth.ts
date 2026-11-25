import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const DURACAO_MAXIMA_SESSAO_SEGUNDOS = 60 * 60 * 8;

// Campos que o formulário de login envia. O nome precisa bater com o que a
// tela usa em signIn("credentials", { ... }).
const credenciaisSchema = z.object({
  usuario: z.string().trim().min(1),
  senha: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: DURACAO_MAXIMA_SESSAO_SEGUNDOS,
    // A sessão não sobrevive ao fechamento do navegador porque o cookie é emitido sem persistência; o maxAge é apenas o teto de uso contínuo.
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Sem maxAge e sem expires: o navegador descarta o cookie ao fechar.
      },
    },
  },
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
      const agora = Math.floor(Date.now() / 1000);
      let sessaoIniciadaEm =
        typeof token.sessaoIniciadaEm === "number" ? token.sessaoIniciadaEm : undefined;

      if (user) {
        token.id = user.id;
        sessaoIniciadaEm = agora;
      } else if (sessaoIniciadaEm === undefined) {
        // Mantém sessões já existentes limitadas pelo instante original de emissão.
        sessaoIniciadaEm = typeof token.iat === "number" ? token.iat : agora;
      }
      token.sessaoIniciadaEm = sessaoIniciadaEm;

      // Auth.js renova o JWT ao consultar a sessão; este marco mantém oito horas
      // como limite absoluto em vez de estender a sessão a cada renovação.
      if (agora - sessaoIniciadaEm >= DURACAO_MAXIMA_SESSAO_SEGUNDOS) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }

      if (typeof token.sessaoIniciadaEm === "number") {
        session.expires = new Date(
          (token.sessaoIniciadaEm + DURACAO_MAXIMA_SESSAO_SEGUNDOS) * 1000,
        ) as Date & string;
      }

      return session;
    },
  },
});
