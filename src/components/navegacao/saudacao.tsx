"use client";

import { useSession } from "next-auth/react";

// Saudação exibida no centro do cabeçalho, com o nome do usuário logado.
// O nome vem do campo `name` da sessão, que o authorize preenche com o login.
function primeiroNome(nomeCompleto: string) {
  // O login é nome.sobrenome. Usamos só o primeiro pedaço, capitalizado.
  const primeiro = nomeCompleto.split(/[.\s]/)[0] ?? "";
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1);
}

function periodoDoDia() {
  const hora = new Date().getHours();

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function Saudacao() {
  const { data: sessao } = useSession();
  const nome = sessao?.user?.name;

  // Enquanto a sessão carrega, não mostramos nada para evitar salto de layout.
  if (!nome) return null;

  return (
    <p className="text-muted-foreground truncate text-center text-xs leading-tight">
      {periodoDoDia()}, <strong className="text-foreground font-semibold">{primeiroNome(nome)}</strong>.
    </p>
  );
}