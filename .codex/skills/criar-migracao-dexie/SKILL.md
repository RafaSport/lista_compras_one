---
name: criar-migracao-dexie
description: Cria ou altera tabela no Dexie com versão incrementada e teste.
---

# Criar migração Dexie

## Quando usar

Quando o requisito pede tabela nova no banco local, coluna nova em tabela existente,
índice novo, ou mudança de estrutura que exige `upgrade`.

## Pré-requisitos

1. Leia `.codex/instrucoes/banco-local.md` antes de escrever qualquer linha.
2. Você sabe qual é a versão atual do schema Dexie. Leia o arquivo de definição do
   banco em `src/` e localize o maior `.version(N)` existente.
3. Você sabe se a mudança é aditiva (tabela nova, índice novo) ou destrutiva
   (renomear coluna, mudar tipo, remover campo). Mudança destrutiva exige migração
   de dados dentro do `upgrade`.
4. `fake-indexeddb` está instalado para os testes.

## Procedimento

1. Abra o arquivo de definição do banco Dexie e localize o último `.version(N)`.
2. Crie um novo bloco `.version(N + 1)` logo abaixo. Nunca edite um bloco de versão
   já publicado — usuários com o banco antigo não rodariam a migração.
3. No `.stores({})` da nova versão, declare o schema completo das tabelas afetadas.
   Dexie exige o schema inteiro da tabela, não só o campo novo.
4. Se a mudança for destrutiva, escreva o `.upgrade(tx => ...)`:
   - Use `tx.table("nome").toCollection().modify(...)` para transformar dados.
   - Nunca use `async/await` dentro do `upgrade`. Use as promessas do Dexie
     encadeadas, porque a transação do IndexedDB fecha se houver `await` externo.
   - Trate o caso de campo ausente: `if (obj.campoAntigo === undefined) return`.
5. Se a mudança for aditiva, o `upgrade` pode ser omitido. Dexie preenche o campo
   novo com `undefined` nos registros antigos.
6. Atualize os tipos TypeScript da tabela no mesmo commit. Tipo e schema andam juntos.
7. Escreva o teste em `<arquivo>.test.ts` ao lado:
   - Importe `fake-indexeddb/auto` no topo.
   - Crie o banco na versão anterior, insira registros no formato antigo.
   - Feche o banco, reabra na versão nova, verifique que os dados foram migrados.
   - Limpe o banco em `beforeEach`.
8. Se a mudança afetar sincronização com o servidor, atualize o esquema de
   `src/esquemas/sincronizacao.ts` e verifique se o servidor aceita o novo formato.

## Limites

- Nunca edite um `.version()` já existente. Sempre crie uma versão nova.
- Nunca use `await` dentro de `.upgrade()`. Use `.then()` ou o retorno da promessa.
- Nunca apague dados do usuário sem migrar. Se precisar remover campo, mova o dado
  para o novo campo antes de descartar.
- Nunca altere schema sem atualizar o tipo TypeScript correspondente.
- Nunca faça migração sem teste que simule o banco na versão anterior.

## Critério de aceitação

- [ ] Nova `.version(N + 1)` criada, nenhuma versão anterior editada.
- [ ] `.stores({})` declara o schema completo das tabelas afetadas.
- [ ] `.upgrade()` presente quando a mudança é destrutiva, sem `await`.
- [ ] Tipos TypeScript atualizados no mesmo commit.
- [ ] Teste simula banco na versão anterior e verifica migração.
- [ ] `fake-indexeddb/auto` importado no teste.
- [ ] `npm test` passa.
- [ ] `npm run tipos` passa.
- [ ] `npm run formatar:verificar` passa.