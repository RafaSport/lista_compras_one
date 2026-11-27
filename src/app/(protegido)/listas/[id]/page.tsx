"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTiposLista } from "@/hooks/use-tipos-lista";
import { AvatarLetra } from "@/components/ui/avatar-letra";
import { Botao } from "@/components/ui/botao";

// Detalhe da lista: mostra os itens padrão do tipo de lista.
// Placeholder: os itens serão implementados no próximo passo.
export default function PaginaDetalheLista() {
  const { data: sessao, status } = useSession();
  const usuarioId = sessao?.user?.id ?? "";
  const parametros = useParams<{ id: string }>();
  const listaId = parametros?.id ?? "";

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

  return <ConteudoDetalhe usuarioId={usuarioId} listaId={listaId} />;
}

function ConteudoDetalhe({
  usuarioId,
  listaId,
}: {
  usuarioId: string;
  listaId: string;
}) {
  const { dados: tiposLista, carregando } = useTiposLista(usuarioId);
  const lista = tiposLista.find((item) => item.id === listaId) ?? null;

  if (carregando) {
    return <p className="text-muted-foreground text-sm">Carregando...</p>;
  }

  if (!lista) {
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          href="/listas"
          aria-label="Voltar para listas"
          className="text-muted-foreground hover:text-foreground flex size-11 items-center justify-center rounded-md"
        >
          <IconeVoltar />
        </Link>
        <h1 className="text-foreground text-lg font-semibold">{lista.nome}</h1>
      </div>

      <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-3">
        <AvatarLetra nome={lista.nome} cor={lista.cor ?? "verde"} />
        <div className="min-w-0 flex-1">
          <p className="text-card-foreground truncate text-sm font-medium">
            {lista.nome}
          </p>
          <p className="text-muted-foreground text-xs">
            Criada em {new Date(lista.criado_em).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
        <p className="text-foreground text-sm font-medium">Itens da lista</p>
        <p className="text-muted-foreground text-xs">
          Os itens padrão desta lista serão implementados no próximo passo.
        </p>
      </div>
    </div>
  );
}

function IconeVoltar() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}