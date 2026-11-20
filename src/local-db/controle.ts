/** Centraliza os campos locais de versão e sincronização. */
import type { ControleSincronizacao, EstadoSincronizacao } from "../types/banco-local";

/** Cria os campos de controle que todo registro local mantém ao ser gravado. */
export function novoControleSincronizacao(agora: string): ControleSincronizacao {
  return {
    versao: 1,
    estado_sincronizacao: "pendente",
    atualizado_em: agora,
    excluido_em: null,
  };
}

/** Avança a versão e marca uma alteração local ou exclusão lógica como pendente. */
export function atualizarControleSincronizacao<T extends ControleSincronizacao>(
  registro: T,
  agora: string,
  estado: EstadoSincronizacao = "pendente",
): Pick<ControleSincronizacao, "versao" | "estado_sincronizacao" | "atualizado_em"> {
  return {
    versao: registro.versao + 1,
    estado_sincronizacao: estado,
    atualizado_em: agora,
  };
}

/** Registra o carimbo de exclusão junto com a alteração pendente de sincronização. */
export function registrarExclusaoSincronizacao<T extends ControleSincronizacao>(
  registro: T,
  agora: string,
): Pick<
  ControleSincronizacao,
  "versao" | "estado_sincronizacao" | "atualizado_em" | "excluido_em"
> {
  return {
    ...atualizarControleSincronizacao(registro, agora),
    excluido_em: agora,
  };
}
