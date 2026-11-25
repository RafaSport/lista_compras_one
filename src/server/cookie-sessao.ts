import "server-only";

const COOKIE_SESSAO = /^(?:__Secure-)?authjs\.session-token(?:\.\d+)?=/i;
const COOKIE_SESSAO_VAZIO = /^(?:__Secure-)?authjs\.session-token(?:\.\d+)?=;/i;

/** Remove persistência do JWT sem interferir nos demais cookies Auth.js. */
export function tornarCookieSessaoTemporario(resposta: Response): Response {
  const cookies = resposta.headers.getSetCookie();
  const possuiCookieDeSessao = cookies.some((cookie) => COOKIE_SESSAO.test(cookie));

  if (!possuiCookieDeSessao) {
    return resposta;
  }

  const cabecalhos = new Headers(resposta.headers);
  cabecalhos.delete("set-cookie");

  for (const cookie of cookies) {
    const eCookieDeSessao = COOKIE_SESSAO.test(cookie);
    const eCookieDeLimpeza = COOKIE_SESSAO_VAZIO.test(cookie);
    const cookieAtualizado =
      eCookieDeSessao && !eCookieDeLimpeza
        ? cookie.replace(/;\s*(?:expires|max-age)=[^;]*/gi, "")
        : cookie;

    cabecalhos.append("set-cookie", cookieAtualizado);
  }

  return new Response(resposta.body, {
    status: resposta.status,
    statusText: resposta.statusText,
    headers: cabecalhos,
  });
}
