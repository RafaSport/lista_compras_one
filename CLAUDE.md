# CLAUDE.md

Leia `AGENTS.md` antes de qualquer tarefa. Ele contém as regras invioláveis do
projeto e tem precedência sobre este arquivo.

## Regras que não podem ser violadas

1. Dinheiro é sempre inteiro em centavos. Nunca use float para valor monetário.
2. `src/dominio/` é puro: sem React, Dexie, Prisma, fetch, `Date.now()`,
   `localStorage`. Entram valores, saem valores.
3. Nomes de arquivo, função e variável em português.
4. TypeScript estrito, sem `any`.
5. Nenhum commit sem `npx tsc --noEmit` limpo.
6. Não instale dependência sem avisar e justificar antes.

## Onde está a especificação

- `.codex/instrucoes/` — instruções por área (domínio, banco local,
  sincronização, rotas, UI). São a especificação do projeto, mesmo com o nome
  da pasta.
- `docs/` — requisitos, modelo de dados, arquitetura, estrutura de pastas.
- `src/dominio/` — 9 funções puras já implementadas e testadas. Reutilize,
  nunca duplique cálculo.

## Verificação antes de dizer que terminou

    npm test
    npm run tipos
    npm run verificar

Cole a saída real. Não afirme que passou sem ter executado.
