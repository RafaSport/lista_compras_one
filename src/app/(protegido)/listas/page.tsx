"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTiposLista } from "@/hooks/use-tipos-lista";
import { AvatarLetra } from "@/components/ui/avatar-letra";
import { Botao } from "@/components/ui/botao";
import { Dialogo } from "@/components/ui/dialogo";

// Tela de listas criadas (tipos de lista).
// Ordena alfabeticamente e mostra a cor escolhida em cada card.
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
  const { dados: tiposLista, carregando, erro, excluir } = useTiposLista(usuarioId);
  const [listaParaExcluir, definirListaParaExcluir] = useState<{
    id: string;
    nome: string;
  } | null>(null);
  const [excluindo, definirExcluindo] = useState(false);

  // Ordenação alfabética, ignorando acentos e maiúsculas.
  const ordenadas = [...tiposLista].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
  );

  async function confirmarExclusao() {
    if (!listaParaExcluir) return;
    definirExcluindo(true);
    try {
      await excluir({ id: listaParaExcluir.id });
      definirListaParaExcluir(null);
    } finally {
      definirExcluindo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-foreground text-lg font-semibold">Minhas Listas</h1>
          <p className="text-muted-foreground text-xs">
            {carregando
              ? "Carregando..."
              : `${ordenadas.length} lista(s) cadastrada(s)`}
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

      {!carregando && !erro && ordenadas.length === 0 && (
        <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-foreground text-sm font-medium">Nenhuma lista criada</p>
          <p className="text-muted-foreground text-xs">
            Toque em Nova para criar sua primeira lista.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {ordenadas.map((lista) => (
          <li
            key={lista.id}
            className="border-border bg-card flex items-center gap-1 rounded-lg border p-3"
          >
            <AvatarLetra nome={lista.nome} cor={lista.cor ?? "verde"} />

            <Link href={`/listas/${lista.id}`} className="min-w-0 flex-1">
              <p className="text-card-foreground truncate text-sm font-medium">
                {lista.nome}
              </p>
              <p className="text-muted-foreground text-xs">
                Criada em {new Date(lista.criado_em).toLocaleDateString("pt-BR")}
              </p>
            </Link>

            {/* Ações: editar e excluir. Alvo de toque de 44px. */}
            <Link
              href={`/listas/${lista.id}/editar`}
              aria-label={`Editar ${lista.nome}`}
              className="text-muted-foreground hover:text-foreground flex size-11 items-center justify-center rounded-md"
            >
              <IconeLapis />
            </Link>

            <Botao
              variante="fantasma"
              onClick={() => definirListaParaExcluir({ id: lista.id, nome: lista.nome })}
              aria-label={`Excluir ${lista.nome}`}
              className="text-muted-foreground hover:text-destructive size-11 p-0"
            >
              <IconeLixeira />
            </Botao>
          </li>
        ))}
      </ul>

      <Dialogo
        aberto={listaParaExcluir !== null}
        aoFechar={() => definirListaParaExcluir(null)}
        titulo="Excluir lista"
        descricao={
          listaParaExcluir
            ? `Excluir "${listaParaExcluir.nome}"? Se houver compras com esta lista, ela será desativada em vez de apagada.`
            : undefined
        }
        textoConfirmar="Excluir"
        aoConfirmar={confirmarExclusao}
        carregando={excluindo}
        varianteConfirmar="perigo"
      />
    </div>
  );
}

function IconeLapis() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconeLixeira() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}