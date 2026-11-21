"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCompras } from "@/hooks/use-compras";
import { useSupermercados } from "@/hooks/use-supermercados";
import { useTiposLista } from "@/hooks/use-tipos-lista";
import { Botao } from "@/components/ui/botao";
import type { Compra } from "@/types/banco-local";

// Tela de Início (RF06, RF07, RF18, RF22, RN10).
// Mostra todas as compras em aberto, cada uma com supermercado e tipo de lista.
// Cada compra pode ser excluída, com confirmação.
export default function PaginaInicio() {
  const { data: sessao } = useSession();
  const usuarioId = sessao?.user?.id ?? "";

  // O gancho exige usuarioId. Enquanto a sessão carrega, passamos string vazia
  // e o gancho devolve lista vazia sem erro.
  const { dados: compras, carregando, erro, excluir } = useCompras(usuarioId);

  // Cadastros usados apenas para traduzir os IDs em nomes na tela.
  const { dados: supermercados } = useSupermercados(usuarioId);
  const { dados: tiposLista } = useTiposLista(usuarioId);

  // Mapas de id -> nome, para não varrer o array a cada render.
  const nomeSupermercado = new Map(supermercados.map((s) => [s.id, s.nome]));
  const nomeTipoLista = new Map(tiposLista.map((t) => [t.id, t.nome]));

  // Só interessam as compras que ainda não foram finalizadas.
  const emAberto = compras.filter(
    (c) => c.situacao === "em_aberto" || c.situacao === "em_montagem",
  );

  // Confirmação antes de apagar. O doc 02 pede confirmação (RF22).
  async function excluirCompra(compra: Compra) {
    if (!window.confirm("Excluir esta compra? Essa ação não pode ser desfeita.")) return;
    await excluir({ compraId: compra.id });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Ação principal da tela */}
      <Link href="/compras/nova">
        <Botao className="w-full">Nova compra</Botao>
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="text-foreground text-sm font-semibold">Compras em aberto</h2>

        {carregando && <p className="text-muted-foreground text-sm">Carregando...</p>}

        {erro && (
          <p role="alert" className="text-destructive text-sm">
            {erro}
          </p>
        )}

        {!carregando && !erro && emAberto.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma compra em aberto. Toque em Nova compra para começar.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {emAberto.map((compra) => (
            <li
              key={compra.id}
              className="border-border bg-card flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              {/* Abre a tela certa conforme a situação da compra */}
              <Link
                href={
                  compra.situacao === "em_montagem"
                    ? `/compras/${compra.id}/montar`
                    : `/compras/${compra.id}/comprar`
                }
                className="min-w-0 flex-1"
              >
                <p className="text-card-foreground truncate text-sm font-medium">
                  {nomeSupermercado.get(compra.supermercado_id) ?? "Supermercado"}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {nomeTipoLista.get(compra.tipo_lista_id) ?? "Tipo de lista"}
                </p>
              </Link>

              <Botao
                variante="perigo"
                tamanho="sm"
                onClick={() => excluirCompra(compra)}
                aria-label="Excluir compra"
              >
                Excluir
              </Botao>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}