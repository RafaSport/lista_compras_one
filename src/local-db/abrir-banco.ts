/** Abre e reutiliza o banco IndexedDB isolado por usuário. */
import { z } from "zod";

import { uuidSchema } from "../schemas/comum";
import { BancoLocal } from "./esquema";

const usuarioIdSchema = uuidSchema;
const bancosAbertos = new Map<string, BancoLocal>();

/** Abre ou reutiliza a instância Dexie exclusiva do usuário autenticado (RN09). */
export function abrirBanco(usuarioId: string): BancoLocal {
  const idValidado = usuarioIdSchema.parse(usuarioId);
  const nomeBanco = `lista-de-compras-${idValidado}`;
  const existente = bancosAbertos.get(nomeBanco);

  if (existente) {
    return existente;
  }

  const banco = new BancoLocal(nomeBanco);
  bancosAbertos.set(nomeBanco, banco);
  return banco;
}

/** Fecha e descarta da memória a conexão de um usuário. */
export async function fecharBanco(usuarioId: string): Promise<void> {
  const nomeBanco = `lista-de-compras-${z.string().uuid().parse(usuarioId)}`;
  const banco = bancosAbertos.get(nomeBanco);

  banco?.close();
  bancosAbertos.delete(nomeBanco);
}
