/** Tipos persistidos no aparelho, incluindo o controle local de sincronização. */
export interface Identificador {
  id: string;
}

export interface IdentificadorCompra {
  compraId: string;
}

export interface IdentificadorItemCompra {
  itemId: string;
}

export interface DadosSupermercado {
  nome: string;
}

export interface DadosTipoLista {
  nome: string;
}

export interface DadosProduto {
  nome: string;
  tipoMedida: "volume" | "peso" | "unidade";
}

export interface DadosItemLista {
  tipoListaId: string;
  produtoId: string;
  quantidadePadrao: number;
  unidadePadrao: "L" | "ml" | "kg" | "g" | "un";
  marca?: string;
  observacao?: string;
}

export interface Atualizacao<T> {
  id: string;
  dados: T;
}

export interface ItensDeTipoLista {
  tipoListaId: string;
}

export interface NovaCompraLocal {
  supermercadoId: string;
  tipoListaId: string;
}

export interface DadosItemCompra {
  quantidade: number;
  unidade: "L" | "ml" | "kg" | "g" | "un";
  embalagem?: string;
  conteudo: number;
  marca?: string;
  observacao?: string;
}

export interface NovoItemCompra extends DadosItemCompra {
  compraId: string;
  produtoId: string;
}

export interface CompraDeItem {
  itemId: string;
  valorUnitario: number;
}

export interface ItensDeCompra {
  compraId: string;
}

export interface ItensPorProduto {
  produtoId: string;
}

export interface PrecoDoProdutoNoSupermercado {
  produtoId: string;
  supermercadoId: string;
}

export interface ComparacaoDePrecoProduto {
  produtoId: string;
  unidadeBase: "L" | "kg" | "un";
}

export interface SupermercadoRecebido {
  id: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export type TipoListaRecebido = SupermercadoRecebido;

export interface ProdutoRecebido extends SupermercadoRecebido {
  tipoMedida: "volume" | "peso" | "unidade";
}

export interface ResultadoFila {
  enviadas: number;
  falhas: number;
}
export type EstadoSincronizacao = "pendente" | "sincronizado";

export interface ControleSincronizacao {
  versao: number;
  estado_sincronizacao: EstadoSincronizacao;
  excluido_em: string | null;
  atualizado_em: string;
}

export interface CadastroLocal extends ControleSincronizacao {
  id: string;
  criado_em: string;
  ativo: boolean;
}

export interface Supermercado extends CadastroLocal {
  nome: string;
}

export interface TipoLista extends CadastroLocal {
  nome: string;
}

export interface Produto extends CadastroLocal {
  nome: string;
  tipo_medida: "volume" | "peso" | "unidade";
}

export interface ItemLista extends ControleSincronizacao {
  id: string;
  tipo_lista_id: string;
  produto_id: string;
  quantidade_padrao: number;
  unidade_padrao: "L" | "ml" | "kg" | "g" | "un";
  marca?: string;
  observacao?: string;
  criado_em: string;
}

export interface Compra extends ControleSincronizacao {
  id: string;
  supermercado_id: string;
  tipo_lista_id: string;
  situacao: "em_montagem" | "em_aberto" | "finalizada";
  valor_total: number | null;
  criada_em: string;
  fechada_em: string | null;
  finalizada_em: string | null;
  salva_em: string | null;
}

export interface ItemCompra extends ControleSincronizacao {
  id: string;
  compra_id: string;
  produto_id: string;
  situacao: "pendente" | "comprado";
  quantidade: number;
  embalagem?: string;
  conteudo: number;
  unidade: "L" | "ml" | "kg" | "g" | "un";
  marca?: string;
  observacao?: string;
  valor_unitario: number | null;
  valor_item: number | null;
  unidade_base: "L" | "kg" | "un" | null;
  preco_unidade_base: number | null;
  comprado_em: string | null;
  criado_em: string;
}

export interface ResumoPreco extends ControleSincronizacao {
  produto_id: string;
  supermercado_id: string;
  unidade_base: "L" | "kg" | "un";
  ultimo_valor: number;
  ultima_compra_em: string;
  soma_precos: number;
  quantidade_compras: number;
}

export interface OperacaoSincronizacao extends ControleSincronizacao {
  id: string;
  compra_id: string;
  estado: "pendente" | "concluida";
  tentativas: number;
  criada_em: string;
  ultimo_erro: string | null;
}
