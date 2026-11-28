import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// Sessão de 30 dias com renovação deslizante (RNF04). O prazo cobre o intervalo
// entre montar a lista em casa e usar no mercado, inclusive sem internet.
const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 30;

// Campos que o formulário de login envia. O nome precisa bater com o que a
// tela usa em signIn("credentials", { ... }).
const credenciaisSchema = z.object({
  usuario: z.string().trim().min(1),
  senha: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
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
        // Cookie persistente: sobrevive ao fechamento do navegador para o app
        // abrir no mercado sem exigir login (RNF04).
        maxAge: DURACAO_SESSAO_SEGUNDOS,
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

      if (user) {
        token.id = user.id;
      }

      // Renovação deslizante (RNF04): o marco avança a cada requisição
      // autenticada. Quem abre o app ao menos uma vez a cada 30 dias nunca é
      // deslogado. Sessões antigas sem o marco herdam o iat como ponto de partida.
      const ultimoAcesso =
        typeof token.ultimoAcesso === "number"
          ? token.ultimoAcesso
          : typeof token.iat === "number"
            ? token.iat
            : agora;

      // Teto de segurança: se o último acesso já passou da janela, a sessão morre.
      if (agora - ultimoAcesso >= DURACAO_SESSAO_SEGUNDOS) {
        return null;
      }

      token.ultimoAcesso = agora;

      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }

      if (typeof token.ultimoAcesso === "number") {
        session.expires = new Date((token.ultimoAcesso + DURACAO_SESSAO_SEGUNDOS) * 1000) as Date &
          string;
      }

      return session;
    },
  },
});
