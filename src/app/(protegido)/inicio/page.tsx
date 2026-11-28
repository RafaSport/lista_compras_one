"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCompras } from "@/hooks/use-compras";
import { useTiposLista } from "@/hooks/use-tipos-lista";
import { Botao } from "@/components/ui/botao";
import { CardResumo } from "@/components/ui/card-resumo";

// Tela de Início (RF06, RF07, RF18, RF22, RN10).
// Tela inicial com cards de resumo e ações rápidas.
export default function PaginaInicio() {
  const { data: sessao, status } = useSession();
  const usuarioId = sessao?.user?.id ?? "";

  // Enquanto a sessão não resolve, não chamamos os ganchos de dados.
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

  return <ConteudoInicio usuarioId={usuarioId} />;
}

function ConteudoInicio({ usuarioId }: { usuarioId: string }) {
  const { dados: compras, carregando } = useCompras(usuarioId);
  const { dados: tiposLista, carregando: carregandoTipos } = useTiposLista(usuarioId);

  // Compras que ainda não foram finalizadas.
  const emAberto = compras.filter(
    (c) => c.situacao === "em_aberto" || c.situacao === "em_montagem",
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Cards de resumo lado a lado */}
      <section className="flex gap-3">
        <CardResumo
          href="/listas"
          rotulo="Listas criadas"
          valor={tiposLista.length}
          carregando={carregandoTipos}
          icone={<IconeLista />}
        />
        <CardResumo
          href="/compras"
          rotulo="Ativas"
          valor={emAberto.length}
          carregando={carregando}
          icone={<IconeSacola />}
        />
      </section>

      {/* Ações rápidas */}
      <section className="flex flex-col gap-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Ações rápidas
        </h2>

        <div className="flex gap-2">
          <Link href="/compras/nova" className="flex-1">
            <Botao className="w-full">Nova compra</Botao>
          </Link>

          <Link href="/listas/nova" className="flex-1">
            <Botao variante="secundario" className="w-full">
              Nova lista
            </Botao>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Ícones inline para não depender de biblioteca externa.
function IconeLista() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function IconeSacola() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
