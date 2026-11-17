import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const ROTAS_PUBLICAS = ["/entrar", "/cadastro"];

export default auth((requisicao: NextRequest & { auth: unknown }) => {
  const { pathname } = requisicao.nextUrl;
  const autenticado = Boolean(requisicao.auth);

  const ehPublica = ROTAS_PUBLICAS.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  );

  if (!autenticado && !ehPublica) {
    const url = requisicao.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("destino", pathname);
    return NextResponse.redirect(url);
  }

  if (autenticado && ehPublica) {
    const url = requisicao.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons).*)",
  ],
};