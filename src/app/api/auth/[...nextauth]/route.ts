import { handlers } from "@/auth";
import { tornarCookieSessaoTemporario } from "@/server/cookie-sessao";
import type { NextRequest } from "next/server";

export async function GET(requisicao: NextRequest): Promise<Response> {
  return tornarCookieSessaoTemporario(await handlers.GET(requisicao));
}

export async function POST(requisicao: NextRequest): Promise<Response> {
  return tornarCookieSessaoTemporario(await handlers.POST(requisicao));
}
