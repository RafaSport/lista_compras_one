"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/forms/campo";
import { Alerta } from "@/components/ui/alerta";

// Tela de cadastro de usuário (RF21, RN12). Rota pública.
// O login é gerado como nome.sobrenome. Se já existir, o servidor responde 409
// e a tela pede um sobrenome diferente.
export default function PaginaCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Prévia do login que será gerado, para o usuário ver antes de enviar.
  const loginPrevisto =
    nome.trim() && sobrenome.trim()
      ? `${nome.trim().toLowerCase()}.${sobrenome.trim().toLowerCase()}`
      : "";

  async function cadastrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSucesso(null);
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

    // Limpa os campos e mostra a mensagem de sucesso por alguns segundos
    // antes de voltar para o login.
    setNome("");
    setSobrenome("");
    setSenha("");
    setSucesso("Usuário criado com sucesso. Redirecionando para o login...");

    setTimeout(() => {
      router.push("/login");
    }, 2500);
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
        <p className="text-muted-foreground text-sm">
          Seu login será <strong>{loginPrevisto}</strong>
        </p>
      )}

      {erro && <Alerta variante="erro">{erro}</Alerta>}

      {sucesso && <Alerta variante="sucesso">{sucesso}</Alerta>}

      <Botao type="submit" carregando={enviando} className="w-full">
        Criar usuário
      </Botao>

      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary font-medium underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}