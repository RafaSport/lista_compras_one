"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTiposLista } from "@/hooks/use-tipos-lista";
import { SeletorCor } from "@/components/ui/seletor-cor";
import { Botao } from "@/components/ui/botao";
import { tipoListaSchema } from "@/schemas/cadastros";
import type { CorLista } from "@/types/banco-local";

// Tela de criação e edição de lista.
// Com ?id=<listaId> na URL, o formulário entra em modo de edição.
// Layout compacto: cabe sem rolagem em telas de celular.
export default function PaginaNovaLista() {
  const { data: sessao, status } = useSession();
  const usuarioId = sessao?.user?.id ?? "";

  if (status === "loading") {
    return <p className="text-muted-foreground text-sm">Carregando...</p>;
  }

  if (status === "unauthenticated" || !usuarioId) {
    return (
      <p className="text-muted-foreground text-sm">
        Sessão não encontrada. Saia e entre novamente.
      </p>
    );
  }

  return <FormularioLista usuarioId={usuarioId} />;
}

function FormularioLista({ usuarioId }: { usuarioId: string }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const listaId = parametros.get("id");
  const editando = listaId !== null;

  const { criar, atualizar, dados: tiposLista, carregando } = useTiposLista(usuarioId);

  // Em modo de edição, carrega os valores atuais da lista.
  const listaAtual = editando
    ? (tiposLista.find((item) => item.id === listaId) ?? null)
    : null;

  const [nome, definirNome] = useState("");
  const [cor, definirCor] = useState<CorLista | null>(null);
  const [preenchido, definirPreenchido] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [salvando, definirSalvando] = useState(false);

  // Preenche o formulário uma única vez, quando a lista chega do banco.
  if (editando && listaAtual && !preenchido) {
    definirNome(listaAtual.nome);
    definirCor(listaAtual.cor ?? null);
    definirPreenchido(true);
  }

  // Validação em tempo real: o botão só habilita com nome e cor válidos.
  const validacao = tipoListaSchema.safeParse({ nome, cor: cor ?? undefined });
  const podeSalvar = validacao.success && !salvando;

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!validacao.success) {
      definirErro(validacao.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    definirSalvando(true);
    definirErro(null);

    try {
      if (editando && listaId) {
        await atualizar({ id: listaId, dados: validacao.data });
      } else {
        await criar(validacao.data);
      }
      // push primeiro; refresh depois revalida a rota de destino.
      router.push("/listas");
      router.refresh();
    } catch (causa) {
      definirErro(
        causa instanceof Error ? causa.message : "Não foi possível salvar a lista.",
      );
      definirSalvando(false);
    }
  }

  // Enquanto a lista de edição ainda não chegou, não mostra o formulário vazio.
  if (editando && carregando) {
    return <p className="text-muted-foreground text-sm">Carregando...</p>;
  }

  if (editando && !carregando && !listaAtual) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-foreground text-sm font-medium">Lista não encontrada</p>
        <Link href="/listas">
          <Botao variante="secundario" tamanho="sm">
            Voltar para listas
          </Botao>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-1">
      {/* Card do formulário, com espaçamento reduzido */}
      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3">
        <p className="text-foreground text-center text-sm font-medium">
          {editando ? "Editar Lista" : "Informações da Lista Nova"}
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="nome-lista" className="text-foreground text-sm font-medium">
            Nome da Lista
          </label>
          <input
            id="nome-lista"
            type="text"
            value={nome}
            onChange={(evento) => definirNome(evento.target.value)}
            placeholder="Ex: Alimentos, Limpeza..."
            maxLength={40}
            autoComplete="off"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring h-9 rounded-md border px-3 text-sm outline-none"
          />
        </div>

        <SeletorCor valor={cor} aoMudar={definirCor} />

        {erro && (
          <p role="alert" className="text-destructive text-xs">
            {erro}
          </p>
        )}
      </div>

      {/* Ações lado a lado, com a mesma largura */}
      <div className="flex gap-2">
        <Link href="/listas" className="flex flex-1">
          <Botao type="button" variante="secundario" className="w-full">
            Cancelar
          </Botao>
        </Link>
        <Botao
          type="submit"
          disabled={!podeSalvar}
          carregando={salvando}
          className="flex-1"
        >
          {editando ? "Salvar Alterações" : "Salvar Lista"}
        </Botao>
      </div>
    </form>
  );
}