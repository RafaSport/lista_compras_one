"use client";

import { Campo } from "@/components/forms/campo";
import { Formulario } from "@/components/forms/formulario";
import { CabecalhoPublico } from "@/components/navegacao/cabecalho-publico";
import { AvisoCentral, type Aviso } from "@/components/ui/aviso-central";
import { Botao } from "@/components/ui/botao";
import { cadastroSchema } from "@/schemas/senha";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Tela de cadastro de usuário (RF21, RN12). Rota pública.
// O login é gerado como nome.sobrenome. Se já existir, o servidor responde 409.
// Erros aparecem num aviso central que se fecha sozinho, e os campos são
// zerados a cada falha para não sobrar dado antigo na próxima tentativa.
export default function PaginaCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  // Contador para o aviso repetido voltar a contar os 3 segundos.
  const chaveAviso = useRef(0);
  const limparCampos = () => {
    setNome("");
    setSobrenome("");
    setSenha("");
    setConfirmacaoSenha("");
  };

  const mostrarAviso = (texto: string) => {
    chaveAviso.current += 1;
    setAviso({ texto, chave: chaveAviso.current });
  };

  // Prévia do login que será gerado. Fica como dica do campo Sobrenome,
  // em vez de um parágrafo próprio, para economizar uma linha na tela.
  const loginPrevisto =
    nome.trim() && sobrenome.trim()
      ? `${nome.trim().toLowerCase()}.${sobrenome.trim().toLowerCase()}`
      : "";

  async function cadastrar(evento: React.FormEvent) {
    evento.preventDefault();

    const dados = { nome, sobrenome, senha, confirmacaoSenha };

    // Valida no cliente com o mesmo schema do servidor. Evita enviar vazio.
    const validacao = cadastroSchema.safeParse(dados);

    if (!validacao.success) {
      // Campo vazio tem prioridade: é o caso mais comum e a mensagem é direta.
      const temCampoVazio = !nome.trim() || !sobrenome.trim() || !senha || !confirmacaoSenha;
      mostrarAviso(
        temCampoVazio
          ? "Preencha todos os campos do formulário."
          : (validacao.error.issues[0]?.message ?? "Preencha todos os campos do formulário."),
      );
      limparCampos();
      return;
    }

    setEnviando(true);
    const resposta = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    setEnviando(false);

    // A rota devolve JSON. Se vier HTML, algo interceptou a requisição
    // (proxy, 404 ou página de erro) e não houve cadastro.
    const tipo = resposta.headers.get("content-type") ?? "";

    if (!tipo.includes("application/json")) {
      mostrarAviso("Não foi possível criar o usuário. Tente novamente.");
      limparCampos();
      return;
    }

    if (resposta.status === 409) {
      mostrarAviso("Esse login já existe. Informe um sobrenome diferente.");
      limparCampos();
      return;
    }

    if (!resposta.ok) {
      mostrarAviso("Não foi possível criar o usuário. Tente novamente.");
      limparCampos();
      return;
    }

    limparCampos();
    // Navega imediatamente com o aviso na URL: não fica preso na tela.
    router.replace("/login?cadastro=ok");
  }

  return (
    <div className="flex flex-col">
      <CabecalhoPublico subtitulo="Faça seu cadastro" />

      <Formulario onSubmit={cadastrar}>
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
          dica={loginPrevisto ? `Seu login: ${loginPrevisto}` : undefined}
          obrigatorio
        />

        <Campo
          rotulo="Senha"
          tipo="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          dica="Use ao menos 1 letra e 1 número."
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

      <AvisoCentral mensagem={aviso} aoFechar={() => setAviso(null)} />
    </div>
  );
}