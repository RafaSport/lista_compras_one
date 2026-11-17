# Rotas, telas e proteção

## Responsabilidade

`src/app/` monta as rotas e compõe telas finas. A proteção acontece em três
camadas: middleware no servidor, guarda no aparelho e checagem na API.

## Limites

- Tela NÃO calcula preço, NÃO acessa Dexie, NÃO acessa Prisma.
- Tela chama `ganchos/` e renderiza `componentes/`.
- Componente do cliente nunca importa de `servidor/`.

## Grupos de rota

- `(publico)` — `/login`, `/cadastro`. Sem login.
- `(protegido)` — todo o resto. Layout com barra inferior.

O grupo não aparece na URL. `/login` continua `/login`.

## Rotas

Siga `docs/02-navegacao.md`, seção 3. Não crie rota nova sem requisito.

Regra de entrada por código da compra, em `/compras/[id]`:

| Situação | Redireciona para |
|----------|------------------|
| `em_montagem` | `/compras/[id]/montar` |
| `em_aberto` | `/compras/[id]/comprar` |
| `finalizada` | fica no detalhe |

## Proteção

1. Middleware (`src/middleware.ts` ou `src/proxy.ts`, conforme a versão do Next):
   sem sessão, redireciona para `/login`. Públicos: `/login`, `/cadastro`,
   manifest, ícones e service worker.
2. Guarda no aparelho: a casca consulta o marcador em
   `lista-de-compras-sessao`. Sem marcador válido ou com `valido_ate` vencido,
   vai para `/login` e não abre dado nenhum.
3. API: todo `/api` exige sessão e só devolve dado do usuário logado.

Sessão válida por 50 dias, renovada a cada acesso com internet (RNF04).

## Login e cadastro

- Login gerado por `gerar-login` em `dominio/`: `nome.sobrenome`, minúsculas, sem
  acento, sem espaço.
- Se o login já existir, a tela pede um sobrenome diferente. Não sugira número
  aleatório nem sufixo automático.
- Senha: mínimo 8 caracteres, com letra e número. Confirmação em campo separado.
  Guardar só o hash. Nunca logar a senha.
- `/cadastro` exige código de convite conferido no servidor. O código vem de
  variável de ambiente. Não escreva o valor no código, não exponha no cliente.
  Compare no servidor com tempo constante.
- A conferência final de login único acontece no INSERT, não só na consulta
  prévia — evita duas pessoas criando o mesmo login ao mesmo tempo.

## Cache e botão voltar

Página protegida não pode aparecer para quem saiu da conta. Depois do logout, o
botão voltar do navegador leva a `/login`. A casca é cacheada; o dado não.

## Validação

- Teste: rota protegida sem sessão redireciona para `/login`.
- Teste: usuário logado abrindo `/login` vai para `/`.
- Teste: `/cadastro` sem código de convite válido é recusado no servidor.
- Teste: senha com 7 caracteres é recusada; `abcdefgh` (só letras) é recusada;
  `abc12345` é aceita.
