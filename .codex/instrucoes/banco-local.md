# Banco local — Dexie e repositórios

## Responsabilidade

`src/banco-local/` define as tabelas do IndexedDB e os repositórios que leem e
gravam. É a única camada que conhece o Dexie.

## Limites

- Pode importar de: `tipos`, `dominio`, `utilitarios`.
- Não pode importar de: `ganchos`, `componentes`, `servidor`, `sincronizacao`.
- Componente e tela NUNCA importam daqui. Sempre passam por `ganchos/`.

## Estrutura

src/banco-local/
esquema.ts Definição das tabelas e versões
abrir-banco.ts Abre o banco do usuário logado
repositorios/
supermercados.ts
tipos-lista.ts
produtos.ts
itens-lista.ts
compras.ts
itens-compra.ts
resumo-precos.ts

## Um banco por usuário

O nome do banco é `lista-de-compras-<usuario_id>`. As tabelas locais NÃO têm
`usuario_id` — o isolamento vem do banco separado (RN09). O banco
`lista-de-compras-sessao` é separado e guarda só o marcador de sessão.

## Contrato de repositório

Toda função de repositório:

- recebe e devolve tipos de `tipos/`, nunca objetos soltos;
- valida a entrada com o esquema Zod de `esquemas/` quando a entrada vem do usuário;
- gera o `id` com `crypto.randomUUID()` quando cria registro novo;
- preenche `criado_em` e `atualizado_em` com ISO UTC;
- roda dentro de `db.transaction` quando toca mais de uma tabela.

Assinatura esperada: a função recebe um objeto de entrada tipado e devolve uma
Promise do tipo da entidade. Exemplo de nome e forma: `criarCompra` recebe
`NovaCompra` e devolve `Promise<Compra>`. Não use parâmetros soltos nem retorno
sem tipo.

## Regras que o repositório garante

- Exclusão vira desativação. Se o cadastro tem compra vinculada, `excluir`
  grava `ativo = false`. Sem histórico, apaga de verdade (RN13, P1).
- Item padrão intocado. `atualizarItemCompra` só escreve em `itens_compra`.
- `resumo_precos` é cache. Pode ser reconstruído a partir de `itens_compra`.
  Toda escrita que muda preço comprado atualiza o resumo na mesma transação.
- Compra finalizada é imutável. Nenhum repositório altera item ou total de
  compra `finalizada`.

## Índices

Declare no `esquema.ts` conforme o documento 03, seção 9:

- `compras`: `id`, `situacao`, `[supermercado_id+tipo_lista_id]`, `salva_em`
- `itens_compra`: `id`, `compra_id`, `[produto_id+comprado_em]`
- `resumo_precos`: `[produto_id+supermercado_id]`

## Migração de versão

Ao mudar o esquema, incremente a versão e escreva o `upgrade`. Nunca edite uma
versão já publicada — isso quebra aparelho que já tem dados.

## Validação

- Teste de repositório com `fake-indexeddb`.
- Teste obrigatório: excluir supermercado com histórico deixa `ativo = false` e o
  histórico continua legível.
- Teste obrigatório: editar item de compra não altera `itens_lista`.
