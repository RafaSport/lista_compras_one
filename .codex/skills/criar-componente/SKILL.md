---
name: criar-componente
description: Cria ou revisa componente de UI seguindo os padrões do projeto.
---

# Criar componente

## Quando usar

Quando o requisito pede um componente novo em `src/componentes/` ou uma revisão
de componente existente que ainda não segue os padrões de UI do projeto.

## Pré-requisitos

1. Leia `.codex/instrucoes/ui-e-componentes.md` antes de escrever qualquer linha.
2. Você sabe em qual subpasta o componente pertence:
   - `ui/` — primitivos reutilizáveis (botão, cartão, diálogo, gaveta, toast)
   - `formulario/` — campos e wrappers de formulário
   - `estados/` — estados de tela (erro, esqueleto, vazio)
3. Você sabe se o componente é de servidor ou de cliente. Regra: só use
   `"use client"` quando houver estado, efeito, evento ou API do browser.

## Procedimento

1. Crie o arquivo em `src/componentes/<subpasta>/<nome-em-kebab-case>.tsx`.
2. Exporte o componente como named export, nunca default.
3. Defina as props em `interface Props` acima do componente, com tipos explícitos.
   Não use `any`. Se a prop for opcional, marque com `?` e dê valor padrão.
4. Use `cn()` de `src/app/lib/utilitarios.ts` para compor classes condicionais.
   Nunca concatene strings de classe manualmente.
5. Aplique os padrões obrigatórios:
   - Mobile-first: comece pelo layout de 1 coluna, adicione breakpoints depois.
   - Alvo de toque mínimo de 44px em qualquer elemento interativo.
   - Acessibilidade: `aria-label` em ícones sem texto, `role` correto, foco visível.
   - Contraste mínimo AA.
6. Se o componente tiver variantes, extraia os mapas de estilo para um arquivo
   `variantes-<nome>.ts` na mesma pasta, como já é feito em `variantes-botao.ts`.
7. Se o componente for composto (com sub-componentes), crie uma pasta com o nome
   do componente, um arquivo por parte e um `index.ts` de barrel.
8. Atualize o `index.ts` da subpasta para exportar o novo componente.
9. Se o componente tiver lógica não trivial (cálculo, derivação de estado),
   extraia para uma função pura e escreva teste.

## Limites

- Componente não importa Dexie, Prisma ou rede. Dados entram por props.
- Componente não faz cálculo de preço. Isso é do domínio.
- Componente não formata moeda ou data diretamente. Use `utilitarios/`.
- Não crie componente novo se um existente resolve com uma prop a mais.

## Critério de aceitação

- [ ] Arquivo no caminho correto, kebab-case, named export.
- [ ] Props tipadas, sem `any`.
- [ ] `"use client"` só quando necessário.
- [ ] Classes compostas com `cn()`.
- [ ] Alvo de toque de 44px nos elementos interativos.
- [ ] `aria-label` em ícones sem texto.
- [ ] Exportado no `index.ts` da subpasta.
- [ ] `npm run tipos` passa.
- [ ] `npm run lint` passa.
- [ ] `npm run formatar:verificar` passa.