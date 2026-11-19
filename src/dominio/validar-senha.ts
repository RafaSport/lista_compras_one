/** Valida o tamanho e a presença de letra e número conforme a regra de senha. */
export function validarSenha(senha: string): boolean {
  return senha.length >= 8 && /\p{L}/u.test(senha) && /[0-9]/.test(senha);
}
