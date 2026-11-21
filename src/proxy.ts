import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Rotas que não exigem sessão. Todo o resto é protegido (RF20).
const ROTAS_PUBLICAS = ["/login", "/cadastro"];

export default auth((requisicao: NextRequest & { auth: unknown }) => {
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

  // Com sessão em rota pública: manda para a raiz, que já é protegida.
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