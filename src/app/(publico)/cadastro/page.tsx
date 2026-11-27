"use client";

import { Campo } from "@/components/forms/campo";
import { Formulario } from "@/components/forms/formulario";
import { Botao } from "@/components/ui/botao";
import { cadastroSchema } from "@/schemas/senha";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

// Tela de cadastro de usuário (RF21, RN12). Rota pública.
// O login é gerado como nome.sobrenome. Se já existir, o servidor responde 409
// e a tela pede um sobrenome diferente. O cadastro exige código de convite.
export default function PaginaCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [codigoConvite, setCodigoConvite] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Erros por campo, preenchidos pela validação do Zod.
  const [erros, setErros] = useState<Record<string, string>>({});

  // Prévia do login que será gerado, para o usuário ver antes de enviar.
  const loginPrevisto =
    nome.trim() && sobrenome.trim()
      ? `${nome.trim().toLowerCase()}.${sobrenome.trim().toLowerCase()}`
      : "";

  useEffect(() => {
    // Ao voltar pelo navegador, o estado antigo pode ser restaurado do cache.
    // Limpa os avisos para a tela não reaparecer com erro velho.
    setErro(null);
    setSucesso(null);
    setErros({});
  }, []);

  async function cadastrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSucesso(null);
    setErros({});

    const dados = { nome, sobrenome, senha, confirmacaoSenha, codigoConvite };

    // Valida no cliente com o mesmo schema do servidor. Evita enviar vazio.
    const validacao = cadastroSchema.safeParse(dados);

    if (!validacao.success) {
      const porCampo: Record<string, string> = {};

      for (const problema of validacao.error.issues) {
        const campo = String(problema.path[0] ?? "");
        if (campo && !porCampo[campo]) {
          porCampo[campo] = problema.message;
        }
      }

      setErros(porCampo);
      setErro("Preencha os campos obrigatórios.");
      return;
    }

    setEnviando(true);

    const resposta = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    setEnviando(false);

    if (resposta.status === 409) {
      setErro("Esse login já existe. Informe um sobrenome diferente.");
      return;
    }

    if (resposta.status === 403) {
      setErro("Código de convite inválido.");
      return;
    }

    if (!resposta.ok) {
      setErro("Não foi possível criar o usuário. Tente novamente.");
      return;
    }

    setNome("");
    setSobrenome("");
    setSenha("");
    setConfirmacaoSenha("");
    setCodigoConvite("");
    setSucesso("Usuário criado com sucesso. Redirecionando para o login...");

    setTimeout(() => {
      router.push("/login");
    }, 2500);
  }

  return (
    <Formulario onSubmit={cadastrar} erroGeral={erro} sucesso={sucesso}>
      <Campo
        rotulo="Nome"
        placeholder="Ex.: Rafael"
        autoComplete="given-name"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        obrigatorio
      />

      <Campo
        rotulo="Sobrenome"
        placeholder="Ex.: Guedes"
        autoComplete="family-name"
        value={sobrenome}
        onChange={(e) => setSobrenome(e.target.value)}
        obrigatorio
      />

      <Campo
        rotulo="Senha"
        tipo="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        dica="Use ao menos uma letra e um número."
        obrigatorio
      />

      <Campo
        rotulo="Confirmar senha"
        tipo="password"
        placeholder="Repita a senha"
        autoComplete="new-password"
        value={confirmacaoSenha}
        onChange={(e) => setConfirmacaoSenha(e.target.value)}
        obrigatorio
      />

      {loginPrevisto && (
        <p className="text-muted-foreground text-sm">
          Seu login será <strong>{loginPrevisto}</strong>
        </p>
      )}

      <Botao type="submit" carregando={enviando} className="w-full">
        Criar usuário
      </Botao>

      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground text-center text-sm underline"
      >
        Voltar para o início
      </Link>
    </Formulario>
  );
}
