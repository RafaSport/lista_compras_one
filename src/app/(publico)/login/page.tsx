"use client";

import { Campo } from "@/components/forms/campo";
import { Formulario } from "@/components/forms/formulario";
import { Botao } from "@/components/ui/botao";
import { LinkTexto } from "@/components/ui/link-texto";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Tela de login (RF20). Rota pública.
// useSearchParams exige Suspense no Next 16, por isso o formulário fica separado.
export default function PaginaLogin() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Carregando...</p>}>
      <FormularioLogin />
    </Suspense>
  );
}

function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Aviso vindo do cadastro. Lido da URL, desaparece ao navegar.
  const cadastroOk = parametros.get("cadastro") === "ok";

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

    setUsuario("");
    setSenha("");

    router.push("/inicio");
    router.refresh();
  }

  return (
    <Formulario
      onSubmit={entrar}
      erroGeral={erro}
      sucesso={erro ? null : cadastroOk ? "Usuário criado. Faça login." : null}
      autoComplete="off"
    >
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

      <Botao type="submit" carregando={enviando} className="w-full">
        Entrar
      </Botao>

      <p className="text-muted-foreground text-center text-sm">
        Ainda não tem conta? <LinkTexto href="/cadastro">Criar usuário</LinkTexto>
      </p>
    </Formulario>
  );
}
