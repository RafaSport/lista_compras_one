/** Gera o login nome.sobrenome normalizado conforme a RN12. */
export function gerarLogin(nome: string, sobrenome: string): string {
  const normalizarParte = (parte: string): string =>
    parte
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  return `${normalizarParte(nome)}.${normalizarParte(sobrenome)}`;
}
