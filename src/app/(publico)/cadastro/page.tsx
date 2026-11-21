"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/forms/campo";

// Tela de cadastro de usuário (RF21, RN12). Rota pública.
// O login é gerado como nome.sobrenome. Se já existir, o servidor responde 409
// e a tela pede um sobrenome diferente.
export default function PaginaCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Prévia do login que será gerado, para o usuário ver antes de enviar.
  const loginPrevisto =
    nome.trim() && sobrenome.trim()
      ? `${nome.trim().toLowerCase()}.${sobrenome.trim().toLowerCase()}`
      : "";

  async function cadastrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resposta = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, sobrenome, senha }),
    });

    setEnviando(false);

    if (resposta.status === 409) {
      setErro("Esse login já existe. Informe um sobrenome diferente.");
      return;
    }

    if (!resposta.ok) {
      setErro("Não foi possível criar o usuário. Tente novamente.");
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={cadastrar} className="space-y-4">
      <Campo
        rotulo="Nome"
        autoComplete="given-name"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />

      <Campo
        rotulo="Sobrenome"
        autoComplete="family-name"
        value={sobrenome}
        onChange={(e) => setSobrenome(e.target.value)}
        required
      />

      <Campo
        rotulo="Senha"
        tipo="password"
        autoComplete="new-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        minLength={6}
      />

      {loginPrevisto && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Seu login será <strong>{loginPrevisto}</strong>
        </p>
      )}

      {erro && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {erro}
        </p>
      )}

      <Botao type="submit" carregando={enviando} className="w-full">
        Criar usuário
      </Botao>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline dark:text-slate-100">
          Entrar
        </Link>
      </p>
    </form>
  );
}