"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTiposLista } from "@/hooks/use-tipos-lista";
import { useEscritaTiposLista } from "@/hooks/use-escrita-tipos-lista";
import { useEstadoInicial } from "@/hooks/use-estado-inicial";
import { Formulario } from "@/components/forms/formulario";
import { Campo } from "@/components/forms/campo";
import { SeletorCor } from "@/components/ui/seletor-cor";
import { Botao } from "@/components/ui/botao";
import { tipoListaSchema } from "@/schemas/cadastros";
import type { CorLista } from "@/types/banco-local";

// Tela de criação e edição de lista.
// Com ?id=<listaId> na URL, o formulário entra em modo de edição.
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

  // Leitura reativa apenas para carregar os valores em modo de edição.
  const { dados: tiposLista, carregando } = useTiposLista(usuarioId);
  // Escrita sem inscrição reativa: não segura a navegação.
  const { criar, atualizar } = useEscritaTiposLista(usuarioId);

  const listaAtual = editando ? (tiposLista.find((item) => item.id === listaId) ?? null) : null;

  const [nome, definirNome] = useState("");
  const [cor, definirCor] = useState<CorLista | null>(null);
  const [preenchido, definirPreenchido] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [salvando, definirSalvando] = useState(false);

  // Devolve o formulário ao estado inicial ao sair da tela.
  useEstadoInicial(() => {
    definirNome("");
    definirCor(null);
    definirErro(null);
    definirSalvando(false);
  });

  // Preenche uma única vez, quando a lista chega do banco.
  if (editando && listaAtual && !preenchido) {
    definirNome(listaAtual.nome);
    definirCor(listaAtual.cor ?? null);
    definirPreenchido(true);
  }

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
      // replace evita deixar o formulário no histórico.
      router.replace("/listas");
    } catch (causa) {
      definirErro(causa instanceof Error ? causa.message : "Não foi possível salvar a lista.");
      definirSalvando(false);
    }
  }

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
    <Formulario onSubmit={salvar} erroGeral={erro} className="gap-3">
      <p className="text-foreground text-center text-sm font-medium">
        {editando ? "Editar Lista" : "Informações da Lista Nova"}
      </p>

      <Campo
        rotulo="Nome da Lista"
        value={nome}
        onChange={(evento) => definirNome(evento.target.value)}
        placeholder="Ex: Alimentos, Limpeza..."
        maxLength={40}
        autoComplete="off"
        obrigatorio
      />

      <SeletorCor valor={cor} aoMudar={definirCor} />

      <div className="flex gap-2">
        <Link href="/listas" className="flex flex-1">
          <Botao type="button" variante="secundario" className="w-full">
            Cancelar
          </Botao>
        </Link>
        <Botao type="submit" disabled={!podeSalvar} carregando={salvando} className="flex-1">
          {editando ? "Salvar Alterações" : "Salvar Lista"}
        </Botao>
      </div>
    </Formulario>
  );
}
