import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Compara o código recebido com CODIGO_CONVITE em tempo constante.
// Os dois lados passam por SHA-256 antes da comparação porque timingSafeEqual
// exige buffers do mesmo tamanho — hashes sempre têm 32 bytes.
export function conferirCodigoConvite(recebido: string): boolean {
  const esperado = process.env.CODIGO_CONVITE;

  // Falha fechada: sem a variável configurada, nenhum cadastro é aceito.
  if (!esperado) {
    console.error("CODIGO_CONVITE não está definida. Cadastro bloqueado.");
    return false;
  }

  const hashRecebido = createHash("sha256").update(recebido, "utf8").digest();
  const hashEsperado = createHash("sha256").update(esperado, "utf8").digest();

  return timingSafeEqual(hashRecebido, hashEsperado);
}