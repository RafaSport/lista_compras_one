/** Define tabelas e índices da versão inicial do banco Dexie. */
import Dexie, { type Table } from "dexie";

import type {
  Compra,
  ItemCompra,
  ItemLista,
  OperacaoSincronizacao,
  Produto,
  ResumoPreco,
  Supermercado,
  TipoLista,
} from "../types/banco-local";

/** Declara as tabelas locais do modelo de dados e seus índices Dexie. */
export const ESQUEMA_INICIAL = {
  supermercados: "id,&nome,atualizado_em",
  tipos_lista: "id,&nome,atualizado_em",
  produtos: "id,&nome,tipo_medida,atualizado_em",
  itens_lista: "id,&[tipo_lista_id+produto_id],tipo_lista_id,produto_id,atualizado_em",
  compras:
    "id,situacao,supermercado_id,tipo_lista_id,[supermercado_id+tipo_lista_id],salva_em,atualizado_em",
  itens_compra:
    "id,compra_id,&[compra_id+produto_id],[produto_id+comprado_em],situacao,atualizado_em",
  resumo_precos: "&[produto_id+supermercado_id],produto_id,supermercado_id,atualizado_em",
  fila_sincronizacao: "id,&compra_id,estado,criada_em,atualizado_em",
} as const;

/** Atualiza somente a tabela que recebeu o índice criado_em. */
const ESQUEMA_VERSAO_2 = {
  compras:
    "id,situacao,supermercado_id,tipo_lista_id,[supermercado_id+tipo_lista_id],salva_em,atualizado_em,criada_em",
} as const;

export class BancoLocal extends Dexie {
  supermercados!: Table<Supermercado, string>;
  tipos_lista!: Table<TipoLista, string>;
  produtos!: Table<Produto, string>;
  itens_lista!: Table<ItemLista, string>;
  compras!: Table<Compra, string>;
  itens_compra!: Table<ItemCompra, string>;
  resumo_precos!: Table<ResumoPreco, [string, string]>;
  fila_sincronizacao!: Table<OperacaoSincronizacao, string>;

  constructor(nome: string) {
    super(nome);
    this.version(1).stores(ESQUEMA_INICIAL);
    this.version(2).stores(ESQUEMA_VERSAO_2);
  }
}
