---
name: criar-tela
description: Cria uma tela nova no App Router seguindo o padrão de tela fina do projeto.
---

# Criar tela

## Quando usar

Quando o requisito pede uma rota nova ou uma tela que ainda não existe.

## Pré-requisitos

1. A rota está em `docs/02-navegacao.md`, seção 3. Se não estiver, pare e pergunte.
2. Você sabe se ela é pública ou protegida.
3. Você sabe quais dados ela mostra e de qual repositório vêm.

## Procedimento

1. Crie o arquivo em `src/app/(publico)/...` ou `src/app/(protegido)/...`,
   conforme a proteção.
2. `page.tsx` monta: layout, componentes e ganchos. Nada além disso.
3. Se a tela precisa de dado reativo, crie o gancho em `src/ganchos/` primeiro.
4. Se a tela precisa de peça visual nova, crie em `src/componentes/<area>/`.
5. Se a rota é dinâmica, valide o parâmetro com Zod antes de usar. Parâmetro
   inválido chama `notFound()`.
6. Se a tela tem estado de carregamento, crie `loading.tsx`. Se pode falhar, crie
   `error.tsx`.

## Proibido

- Calcular preço dentro da tela. Use `dominio/`.
- Importar `banco-local` ou `servidor` na tela.
- Criar rota que não está no documento de navegação.
- Sobrescrever `page.tsx` existente.

## Critério de aceitação

- [ ] A rota responde no caminho exato do documento 02.
- [ ] Rota protegida redireciona para `/login` sem sessão.
- [ ] A tela não importa `banco-local` nem `servidor`.
- [ ] Nenhum cálculo de preço no arquivo da tela.
- [ ] `npm run tipos` passa.
- [ ] Se a tela tem regra testável, existe teste.
