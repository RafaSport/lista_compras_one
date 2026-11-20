/** Testes do contrato de banco-local. */

import { describe, expectTypeOf, it } from "vitest";

import type {
  Compra,
  ItemCompra,
  ItemLista,
  OperacaoSincronizacao,
  Produto,
  ResumoPreco,
  Supermercado,
  TipoLista,
} from "./banco-local";

describe("tipos do banco local", () => {
  it("representa dinheiro persistido como número inteiro em centavos", () => {
    expectTypeOf<Compra["valor_total"]>().toEqualTypeOf<number | null>();
    expectTypeOf<ItemCompra["valor_unitario"]>().toEqualTypeOf<number | null>();
    expectTypeOf<ItemCompra["valor_item"]>().toEqualTypeOf<number | null>();
    expectTypeOf<ResumoPreco["soma_precos"]>().toEqualTypeOf<number>();
  });

  it("inclui as entidades definidas para o aparelho", () => {
    expectTypeOf<Supermercado["ativo"]>().toEqualTypeOf<boolean>();
    expectTypeOf<TipoLista["nome"]>().toEqualTypeOf<string>();
    expectTypeOf<Produto["tipo_medida"]>().toEqualTypeOf<"volume" | "peso" | "unidade">();
    expectTypeOf<ItemLista["quantidade_padrao"]>().toEqualTypeOf<number>();
    expectTypeOf<OperacaoSincronizacao["tentativas"]>().toEqualTypeOf<number>();
  });
});
