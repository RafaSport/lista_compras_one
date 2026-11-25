"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTiposLista } from "@/hooks/use-tipos-lista";
import { AvatarLetra } from "@/components/ui/avatar-letra";
import { Botao } from "@/components/ui/botao";

// Tela de listas criadas (tipos de lista).
// Cada card mostra o nome, a quantidade de itens e a data de criação.
export default function PaginaListas() {
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

  return <ConteudoListas usuarioId={usuarioId} />;
}

function ConteudoListas({ usuarioId }: { usuarioId: string }) {
  const { dados: tiposLista, carregando, erro } = useTiposLista(usuarioId);

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho da seção: título, contador e botão de nova lista */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-foreground text-lg font-semibold">Minhas Listas</h1>
          <p className="text-muted-foreground text-xs">
            {carregando
              ? "Carregando..."
              : `${tiposLista.length} lista(s) cadastrada(s)`}
          </p>
        </div>

        <Link href="/listas/nova">
          <Botao tamanho="sm">+ Nova</Botao>
        </Link>
      </div>

      {erro && (
        <p role="alert" className="text-destructive text-sm">
          {erro}
        </p>
      )}

      {!carregando && !erro && tiposLista.length === 0 && (
        <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-foreground text-sm font-medium">Nenhuma lista criada</p>
          <p className="text-muted-foreground text-xs">
            Toque em Nova para criar sua primeira lista.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {tiposLista.map((lista) => (
          <li
            key={lista.id}
            className="border-border bg-card flex items-center gap-3 rounded-lg border p-3"
          >
            <AvatarLetra nome={lista.nome} />

            <Link href={`/listas/${lista.id}`} className="min-w-0 flex-1">
              <p className="text-card-foreground truncate text-sm font-medium">
                {lista.nome}
              </p>
              <p className="text-muted-foreground text-xs">
                Criada em{" "}
                {new Date(lista.criado_em).toLocaleDateString("pt-BR")}
              </p>
            </Link>

            <span aria-hidden className="text-muted-foreground text-lg">
              ›
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}