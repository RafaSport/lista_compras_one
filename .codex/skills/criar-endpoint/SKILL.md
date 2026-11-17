---
name: criar-endpoint
description: Cria um Route Handler em /api seguindo o padrão de sessão e validação do projeto.
---

# Criar endpoint

## Quando usar

Quando o aparelho precisa enviar ou buscar dado no servidor. Não use Server Action.

## Pré-requisitos

1. O endpoint está em `docs/04-arquitetura.md`, seção 6.3. Se não estiver, pergunte.
2. Você sabe o formato de entrada e de saída.
3. Você sabe se a operação é idempotente.

## Procedimento

1. Crie `src/app/api/<recurso>/route.ts`.
2. Primeira linha do arquivo de lógica: `import "server-only"`.
3. Confira a sessão. Sem sessão, `401`. Nunca devolva dado de outro usuário.
4. Valide o corpo com o esquema Zod de `esquemas/`. Inválido, `400`, sem gravar.
5. Grave em transação. Operação de envio usa upsert por `id`.
6. Devolva só o necessário. Nunca devolva hash, token ou dado de outro usuário.
7. Erro interno: `500` com mensagem genérica. Detalhe só no log do servidor.

## Proibido

- Confiar em `usuario_id` vindo do corpo da requisição. Sempre vem da sessão.
- Logar senha, token ou corpo inteiro da requisição.
- Escrever segredo no código.
- Devolver `error.message` cru para o cliente.

## Critério de aceitação

- [ ] Sem sessão retorna `401`.
- [ ] Corpo inválido retorna `400` e nada gravado.
- [ ] Envio repetido do mesmo `id` não duplica.
- [ ] Nenhum dado de outro usuário é acessível.
- [ ] `npm run tipos` passa.
