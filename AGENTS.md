# Lista de Compras — instruções para agentes

Aplicativo pessoal de lista de compras. PWA offline-first, mobile-first, em português.
O aparelho faz o trabalho do dia a dia (IndexedDB/Dexie). O servidor guarda compras
finalizadas e serve de base para o histórico.

## Documentos do projeto

Leia o documento da área antes de mexer nela. Não deduza regra de negócio do código.

| Documento                        | Assunto                                           |
| -------------------------------- | ------------------------------------------------- |
| `docs/01-requisitos.md`          | RF, RN, RNF. Fonte da verdade funcional.          |
| `docs/02-navegacao.md`           | Rotas, telas, fluxo de navegação.                 |
| `docs/03-modelo-de-dados.md`     | Tabelas, campos, cálculos, efeitos de cada ação.  |
| `docs/04-arquitetura.md`         | Camadas, offline, login, sincronização.           |
| `docs/05-estrutura-de-pastas.md` | Onde cada arquivo fica e quem importa quem.       |
| `docs/metodo-de-trabalho.md`     | Como conduzir a tarefa: etapas, revisão, entrega. |     |

## Instruções por área

Carregue só a que for relevante para a tarefa:

- `.codex/instrucoes/dominio.md` — cálculos de preço, conversão de unidade, médias.
- `.codex/instrucoes/banco-local.md` — Dexie, repositórios, resumo_precos.
- `.codex/instrucoes/rotas-e-protecao.md` — App Router, middleware, sessão, login.
- `.codex/instrucoes/sincronizacao.md` — fila, idempotência, /api/compras.
- `.codex/instrucoes/ui-e-componentes.md` — shadcn, mobile-first, telas finas.

## Skills

Procedimentos repetíveis com critério de aceitação. Use quando a tarefa casar:

- `.codex/skills/criar-tela/SKILL.md`
- `.codex/skills/criar-repositorio/SKILL.md`
- `.codex/skills/criar-endpoint/SKILL.md`
- `.codex/skills/criar-componente/SKILL.md`
- `.codex/skills/criar-teste/SKILL.md`
- `.codex/skills/criar-migracao-dexie/SKILL.md`
- `.codex/skills/calcular-preco/SKILL.md`
- `.codex/skills/revisar-pr/SKILL.md`

## Skills de terceiros

A pasta `.agents/` contém skills de terceiros (Prisma e afins), instaladas por
ferramenta externa. Regras:

- Não edite nada em `.agents/`. Atualização sobrescreve.
- Não use `.agents/` como referência de padrão do projeto. O padrão do projeto
  está em `.codex/` e `docs/`.
- `.agents/` está no `.prettierignore` e não entra em verificação de formatação.
- Se uma skill de `.agents/` conflitar com uma regra deste arquivo, vale este
  arquivo.

## Regras invioláveis

Estas quebram o sistema se violadas. Não negocie, não "melhore".

1. Dinheiro é inteiro em centavos. Nunca float, nunca number com casas decimais
   para valor monetário. R$ 9,00 é 900.
2. O dominio é puro. Sem React, sem Dexie, sem Prisma, sem fetch. Só funções que
   recebem valores e devolvem valores.
3. Telas não falam com o banco. app/ não importa local-db nem server.
   Sempre passa por hooks/.
4. server/ nunca chega ao cliente. Todo arquivo em server/ começa com
   import "server-only".
5. Um banco Dexie por usuário. Nome lista-de-compras-<usuario_id>. As tabelas
   locais não têm usuario_id.
6. UUID gerado no aparelho. Todo id nasce no cliente, inclusive de cadastros.
   É o que garante idempotência no envio.
7. Item padrão nunca muda. Editar um item durante a compra altera só
   itens_compra. itens_lista fica intacto.
8. Cadastro com histórico não é apagado. Vira ativo = false.
9. Nomes em inglês para pastas; arquivos, funções, variáveis, campos e tipos em português.
   Exceção: page.tsx, layout.tsx, route.ts, loading.tsx, error.tsx,
   not-found.tsx e os arquivos gerados pelo shadcn.
10. Comentários e mensagens de interface em português.

## Regras de trabalho neste repositório

- Não apague nem sobrescreva arquivos existentes. Se precisar criar algo que já
  existe, crie com outro caminho e registre o conflito no relatório final. O dono
  resolve manualmente.
- Não instale dependência nova sem que o requisito peça. A stack está fechada em
  docs/04-arquitetura.md, seção 3.
- Não crie Server Action para envio de compras. O envio é feito pelo aparelho,
  com fila e tentativa. Use Route Handler.
- Não invente requisito. Se a tarefa exige algo que não está nos documentos,
  pare e pergunte.
- Não escreva segredo no código. Código de convite, AUTH_SECRET e string do
  banco vêm de variável de ambiente. Se a variável não existir, crie .env.example
  com a chave vazia e registre no relatório.
- Prisma 7: a URL de conexão NÃO fica no schema.prisma. Fica em prisma7.config.ts,
  lida de process.env.DATABASE_URL. O bloco datasource do schema tem apenas o
  provider.
- Zod 4: use `error: "mensagem"` em `z.enum()` e em `.number()`. Não use
  `errorMap` nem `invalid_type_error` — não existem no Zod 4 e quebram o tsc.
- Antes de escrever código com uma biblioteca, confirme a versão instalada
  (npm ls <pacote> ou package.json). A sintaxe muda entre versões maiores:
  Zod 3 usa errorMap/invalid_type_error; Zod 4 usa error. Prisma 6 tem url no
  schema; Prisma 7 tem no prisma7.config.ts. Não presuma versão.
- Prisma 7: `prisma db execute` NÃO aceita --schema. O schema vem do
  prisma7.config.ts. Use `npx prisma db execute --stdin` ou `--file`.
- Prisma 7: `prisma migrate` cria as tabelas mas NÃO gera o client. Depois de
  qualquer mudança no schema, rode `npx prisma generate` antes do tsc. Sem isso,
  o import de PrismaClient falha com "não tem nenhum membro exportado".
- O proxy (src/proxy.ts) NÃO intercepta /api/*. O matcher exclui `api` inteiro.
  Cada Route Handler valida a sessão sozinho via usuarioAtual() (src/server/sessao.ts).
  Motivo: o proxy redirecionava POSTs de API para /login, devolvendo HTML com
  status 200 e mascarando falhas como sucesso.

## Verificação obrigatória

Antes de dizer que terminou, rode o que existir:

- npm run tipos (tsc --noEmit)
- npm run formatar:verificar
- npm run verificar (lint + tipos)
- npm test (Vitest)

Se um script não existir, diga isso no relatório em vez de inventar resultado.
Nunca afirme que um teste passou sem ter executado.

## Formato do relatório final

Toda entrega termina com:

1. Arquivos criados (caminho completo).
2. Arquivos que você NÃO tocou por já existirem (conflitos).
3. O que foi implementado, por requisito (cite RF/RN).
4. Comandos executados e resultado real de cada um.
5. Pendências e decisões que precisam do dono.

## Proxy e rotas de API

- O proxy (`src/proxy.ts`) NÃO intercepta `/api/*`. O matcher exclui `api` inteiro.
- Cada Route Handler valida a sessão por conta própria via `usuarioAtual()`
  (`src/server/sessao.ts`), devolvendo 401 quando não há sessão.
- Motivo: quando o matcher excluía apenas `api/auth`, o proxy redirecionava POSTs
  de API para `/login` e devolvia HTML com status 200. O formulário de cadastro
  interpretava esse 200 como sucesso, exibia "usuário criado" e nada era gravado.
- Consequência: nenhuma rota de API pode depender do proxy para autorização.
