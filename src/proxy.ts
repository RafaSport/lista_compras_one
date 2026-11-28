import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { auth } from "@/auth";

// Rotas que não exigem sessão. Todo o resto é protegido (RF20).
const ROTAS_PUBLICAS = ["/login", "/cadastro"];

const autenticarRequisicao = auth(
  (requisicao: NextRequest & { auth: unknown }, _evento: NextFetchEvent) => {
    void _evento;

    const { pathname } = requisicao.nextUrl;
    const autenticado = Boolean(requisicao.auth);

    // Considera pública a rota exata e suas subpastas.
    const ehPublica = ROTAS_PUBLICAS.some(
      (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
    );

    // Sem sessão em rota privada: manda para o login guardando o destino.
    if (!autenticado && !ehPublica) {
      const url = requisicao.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("destino", pathname);
      return NextResponse.redirect(url);
    }

    // Com sessão em rota pública: manda para a tela inicial protegida.
    if (autenticado && ehPublica) {
      const url = requisicao.nextUrl.clone();
      url.pathname = "/inicio";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
);

export default async function proxy(requisicao: NextRequest, evento: NextFetchEvent) {
  return autenticarRequisicao(requisicao, evento);
}

export const config = {
  matcher: [
    // Exclui as rotas de API: elas fazem a própria autorização no Route Handler.
    // Sem isso, o proxy redireciona POSTs para /login e devolve HTML em vez de JSON.
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons).*)",
  ],
};
