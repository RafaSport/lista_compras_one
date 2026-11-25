"use client";

import { Campo } from "@/components/forms/campo";
import { Alerta } from "@/components/ui/alerta";
import { Botao } from "@/components/ui/botao";
import { LinkTexto } from "@/components/ui/link-texto";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Tela de login (RF20). Rota pública.
// O login é gerado como nome.sobrenome no cadastro, por isso o campo é "usuário".
export default function PaginaLogin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Envia as credenciais. Em sucesso, abre a tela inicial protegida.
  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const resultado = await signIn("credentials", {
      usuario,
      senha,
      redirect: false,
    });

    setEnviando(false);

    if (resultado?.error) {
      setErro("Usuário ou senha inválidos.");
      return;
    }

    // Limpa os campos antes de sair da tela.
    setUsuario("");
    setSenha("");

    router.push("/inicio");
    router.refresh();
  }

  return (
    <form onSubmit={entrar} className="space-y-4" autoComplete="off">
      <Campo
        rotulo="Usuário"
        autoComplete="username"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        required
      />

      <Campo
        rotulo="Senha"
        tipo="password"
        autoComplete="current-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      {erro && <Alerta variante="erro">{erro}</Alerta>}

      <Botao type="submit" carregando={enviando} className="w-full">
        Entrar
      </Botao>

      {/* Rodapé do formulário: link para a tela de cadastro. */}
      <p className="text-muted-foreground text-center text-sm">
        Ainda não tem conta? <LinkTexto href="/cadastro">Criar usuário</LinkTexto>
      </p>
    </form>
  );
}
