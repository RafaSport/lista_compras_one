---
name: criar-teste
description: Escreve teste unitário ou de componente com Vitest e Testing Library.
---

# Criar teste

## Quando usar

Quando o requisito pede teste novo, ou quando uma função/componente existente
não tem cobertura e precisa de teste antes de ser alterado.

## Pré-requisitos

1. Você sabe o que está testando: função pura, hook, componente ou integração com Dexie.
2. Você sabe o comportamento esperado, não a implementação. Teste o que a função
   faz, não como ela faz.
3. As bibliotecas instaladas são: `vitest`, `@testing-library/react`,
   `@testing-library/jest-dom` e `fake-indexeddb`.

## Procedimento

1. Crie o arquivo de teste ao lado do arquivo testado, com sufixo `.test.ts` ou
   `.test.tsx`. Exemplo: `src/dominio/preco.ts` → `src/dominio/preco.test.ts`.
2. Importe `describe`, `it`, `expect` de `vitest`. Não use `jest`.
3. Nomeie o `describe` com o nome da função ou componente. Nomeie o `it` com o
   comportamento esperado em linguagem natural: "retorna 180 quando o galão tem 5 L por R$ 9".
4. Para função pura: teste entrada e saída. Cubra o caso feliz, os limites e os
   casos de borda. Não mocke função pura.
5. Para componente: use `render` de `@testing-library/react`, busque elementos por
   papel acessível (`getByRole`, `getByLabelText`), nunca por classe CSS ou test-id
   quando houver alternativa semântica.
6. Para Dexie: importe `fake-indexeddb/auto` no topo do arquivo de teste. Use um
   banco novo por teste, com `beforeEach` limpando as tabelas.
7. Cubra sempre estes casos de borda quando aplicáveis: valor zero, valor negativo,
   entrada vazia, unidade incompatível, divisão por zero.
8. Um `it` deve testar uma coisa só. Se o nome do teste tem "e", provavelmente são
   dois testes.

## Limites

- Não teste detalhe de implementação (nome de função interna, estado privado).
- Não use snapshot de componente inteiro. Prefira asserção sobre o que o usuário vê.
- Não use `waitFor` com tempo arbitrário. Prefira `findBy*` que espera o elemento.
- Não escreva teste que depende de ordem de execução de outros testes.

## Critério de aceitação

- [ ] Arquivo ao lado do testado, sufixo `.test.ts` ou `.test.tsx`.
- [ ] `describe` e `it` com nomes descritivos em linguagem natural.
- [ ] Caso feliz, limites e bordas cobertos.
- [ ] Componente buscado por papel acessível.
- [ ] Dexie usa `fake-indexeddb/auto` e limpa entre testes.
- [ ] `npm test` passa.
- [ ] `npm run tipos` passa.
- [ ] `npm run formatar:verificar` passa.