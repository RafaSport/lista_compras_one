---
name: criar-repositorio
description: Cria um repositório Dexie para uma tabela do banco local.
---

# Criar repositório

## Quando usar

Quando uma tabela de `docs/03-modelo-de-dados.md` ainda não tem repositório, ou
quando falta uma operação em um repositório existente.

## Pré-requisitos

1. A tabela está definida no documento 03, seção 4.
2. Os campos e tipos batem com `src/tipos/`.
3. Você sabe quais regras de negócio a operação precisa respeitar.

## Procedimento

1. Declare a tabela em `src/banco-local/esquema.ts` com os índices do documento 03,
   seção 9.
2. Crie `src/banco-local/repositorios/<tabela>.ts`.
3. Toda função recebe e devolve tipo de `tipos/`.
4. Valide entrada do usuário com o esquema Zod de `esquemas/`.
5. Gere `id` com `crypto.randomUUID()` e preencha `criado_em`/`atualizado_em`.
6. Use `db.transaction` quando tocar mais de uma tabela.
7. Se a operação muda preço comprado, atualize `resumo_precos` na mesma transação.

## Regras que não podem faltar

- Excluir cadastro com histórico vira `ativo = false`, não `delete`.
- Editar item de compra escreve só em `itens_compra`.
- Compra `finalizada` não aceita nenhuma escrita.

## Critério de aceitação

- [ ] Nenhum componente importa este arquivo diretamente.
- [ ] Teste com `fake-indexeddb` cobre criação, leitura e a regra de desativação.
- [ ] `npm run tipos` passa.
- [ ] `npm test` passa.
