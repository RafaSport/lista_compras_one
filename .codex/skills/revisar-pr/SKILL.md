---
name: revisar-pr
description: Revisa alterações antes do commit, com checklist de qualidade e segurança.
---

# Revisar PR

## Quando usar

Antes de abrir pull request ou commitar em `main`. Também quando o requisito pede
revisão de código de outra pessoa ou de uma alteração própria já escrita.

## Pré-requisitos

1. Você sabe o que a alteração se propõe a fazer. Se não souber, leia a descrição
   da tarefa ou o commit antes de revisar.
2. Você tem o diff disponível. Rode `git diff` (working tree) ou
   `git diff main...HEAD` (branch inteira).
3. As validações do projeto existem: `npm run verificar`, `npm test`,
   `npm run formatar:verificar`.

## Procedimento

1. Leia o diff inteiro antes de comentar qualquer linha. Entenda a intenção antes
   de julgar o detalhe.
2. Verifique se a alteração faz o que se propõe. Se o diff resolve outra coisa,
   ou resolve a mais, sinalize.
3. Passe pelo checklist de correção:
   - Dinheiro é inteiro em centavos, sem float.
   - `preco_unidade_base` persistido é inteiro em centavos por unidade base.
   - Componente não importa Dexie, Prisma ou rede.
   - Domínio não importa React, Dexie ou rede.
   - `"use client"` só onde há estado, efeito, evento ou API do browser.
   - Nenhum `any` novo sem justificativa em comentário.
   - Nenhum `console.log` esquecido.
   - Nenhum segredo, token ou senha no código.
4. Passe pelo checklist de teste:
   - Função de domínio nova tem teste.
   - Componente com lógica não trivial tem teste.
   - Migração Dexie tem teste que simula a versão anterior.
   - Casos de borda cobertos: zero, negativo, vazio, divisão por zero.
5. Passe pelo checklist de banco:
   - Nenhuma `.version()` do Dexie foi editada, só criada.
   - Nenhum `await` dentro de `.upgrade()`.
   - Tipo TypeScript atualizado junto com o schema.
6. Passe pelo checklist de acessibilidade e UI:
   - Alvo de toque de 44px em elementos interativos.
   - `aria-label` em ícone sem texto.
   - Contraste AA.
   - Layout mobile-first.
7. Rode as validações e registre a saída real:
   - `npm run verificar`
   - `npm test`
   - `npm run formatar:verificar`
8. Se algo falhar, aponte o arquivo, a linha e o motivo. Não reescreva o código
   do autor sem pedir — aponte e deixe a decisão para quem escreveu.
9. Se tudo passar, escreva um resumo curto: o que a alteração faz, o que foi
   verificado e o que ficou fora de escopo.

## Limites

- Não reescreva o código do autor sem pedir. Aponte o problema e sugira.
- Não bloqueie PR por preferência de estilo que o Prettier já resolve.
- Não bloqueie PR por refatoração que não faz parte do escopo da tarefa.
- Não aprove PR com validação falhando, mesmo que o erro pareça antigo.
- Não comente linha que você não leu no contexto do arquivo inteiro.

## Critério de aceitação

- [ ] Diff lido inteiro antes de comentar.
- [ ] Checklist de correção, teste, banco e UI percorrido.
- [ ] `npm run verificar` passa.
- [ ] `npm test` passa.
- [ ] `npm run formatar:verificar` passa.
- [ ] Nenhum problema apontado sem arquivo e linha.
- [ ] Resumo final escrito.