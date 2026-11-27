# Checklist do Projeto — Lista de Compras

> Documento de acompanhamento do desenvolvimento.
> Legenda: `[x]` concluído e verificado · `[ ]` pendente · `[?]` existe no código mas não foi inspecionado a fundo.

**Última atualização:** 27/11/2026

## Visão geral

| Estado | Quantidade | Descrição |
| --- | --- | --- |
| `[x]` Concluído | 52 | Confirmado no código com testes passando |
| `[ ]` Pendente | 14 | Ausente no repositório ou incompleto |
| `[?]` A verificar | 8 | Existe no código mas não foi inspecionado |

---

## 1. Autenticação e sessão

### 1.1 Sessão no servidor

- [x] Sessão JWT com estratégia `jwt` em `src/auth.ts`
- [ ] Duração da sessão em 50 dias (hoje está 8 horas — divergente do RNF04)
- [ ] Renovação deslizante a cada acesso com internet
- [x] Cookie `httpOnly`, `sameSite: lax`, `secure` em produção
- [x] Callback `jwt` preenchendo `token.id` com o id do usuário
- [x] Callback `session` expondo `session.user.id`
- [x] Tipos extras da sessão em `src/types/next-auth.d.ts`

### 1.2 Proteção de rotas

- [x] Proxy em `src/proxy.ts` com `ROTAS_PUBLICAS = /login` e `/cadastro`
- [x] Redirecionamento para `/login` com `?destino=` quando sem sessão
- [x] Redirecionamento de usuário logado em rota pública para `/inicio`
- [x] Matcher excluindo `api/auth`, `_next/static`, `_next/image`, `favicon`, `manifest`, `sw.js` e `icons`
- [ ] Remover dependência de `tornarCookieSessaoTemporario` (arquivo órfão)

### 1.3 Marcador de sessão local (documento 5.2)

- [ ] Criar banco Dexie `lista-de-compras-sessao`
- [ ] Campos `usuario_id`, `nome` e `valido_ate`
- [ ] Criado após login com internet
- [ ] Renovado a cada acesso com internet
- [ ] Guarda no cliente que consulta o marcador antes de abrir dados
- [ ] Sem marcador válido, redireciona para `/login` sem abrir dados
- [ ] Logout apaga o marcador
- [ ] Validade de 50 dias alinhada ao RNF04

---

## 2. Cadastro e login

- [x] Rota `POST /api/cadastro` em `src/app/api/cadastro/route.ts`
- [x] Schema `cadastroSchema` unificado em `src/schemas/senha.ts`
- [x] Validação de senha: mínimo 8 caracteres, ao menos uma letra e um número
- [x] Confirmação de senha em campo separado com `refine`
- [x] Geração de login `nome.sobrenome` normalizado (NFD, sem acento, minúsculas)
- [x] Recusa de login duplicado com HTTP 409
- [x] Conferência de unicidade no INSERT via `try/catch`, não só na consulta prévia
- [x] Hash de senha com bcrypt custo 10
- [x] Tela de cadastro com `Formulario` e `Campo` do projeto
- [x] Validação no cliente com `safeParse` antes do `fetch`
- [x] Placeholders em todos os campos
- [x] Link de voltar para o início
- [ ] Mensagens de erro do Zod traduzidas (hoje retorna "Dados inválidos." genérico)
- [ ] Decidir destino da rota órfã `src/app/api/usuarios/route.ts`

---

## 3. Layout e mobile-first

- [x] Layout raiz com `h-full` e `overflow-hidden` em `src/app/layout.tsx`
- [x] Layout público com cabeçalho fixo e miolo rolável em `src/app/(publico)/layout.tsx`
- [x] Formulário com rolagem interna em `src/components/forms/formulario.tsx`
- [x] Componente `Campo` acessível com `htmlFor`, `aria-invalid` e `aria-describedby`
- [x] Botão mostrar/ocultar senha no `Campo`
- [x] Rodapé com `shrink-0` para não empurrar conteúdo
- [?] Layout protegido com barra inferior em `src/app/(protegido)/layout.tsx`
- [?] Rolagem residual na tela de cadastro em viewport pequena
- [?] Aviso de erro sumindo ao sair da página (`useEffect` limpando estado)
- [?] Alvo de toque mínimo de 44px em todos os elementos interativos

---

## 4. Banco local (Dexie)

- [x] Esquema do banco em `src/local-db/esquema.ts`
- [x] Abertura do banco em `src/local-db/abrir-banco.ts`
- [x] Um banco por usuário com nome `lista-de-compras-<usuario_id>`
- [x] Validação do `usuarioId` com `uuidSchema` antes de abrir
- [x] Cache de conexões abertas em `Map`
- [x] Função `fecharBanco` para descartar conexão
- [x] Controle de versão e migração em `src/local-db/controle.ts`
- [x] Repositório de compras
- [x] Repositório de itens-compra
- [x] Repositório de itens-lista
- [x] Repositório de produtos
- [x] Repositório de supermercados
- [x] Repositório de tipos-lista
- [x] Repositório de resumo-precos
- [?] Regra: excluir cadastro com histórico vira `ativo = false`
- [?] Regra: editar item de compra altera só `itens_compra`
- [?] Regra: compra finalizada é imutável
- [ ] `resumo_precos` reconstruível a partir de `itens_compra`

---

## 5. Regras de domínio (todas com teste)

- [x] `calcular-preco-unidade-base.ts` (8 testes)
- [x] `calcular-total-compra.ts` (4 testes)
- [x] `calcular-ultimo-e-media.ts` (7 testes)
- [x] `calcular-valor-item.ts` (5 testes)
- [x] `comparar-supermercados.ts` (5 testes)
- [x] `converter-unidade.ts` (4 testes)
- [x] `gerar-login.ts` (6 testes)
- [x] `pode-finalizar-compra.ts` (5 testes)
- [x] `validar-senha.ts` (7 testes)

---

## 6. API REST

### 6.1 Rotas de coleção

- [x] `POST /api/compras` com `server-only`, sessão e validação Zod
- [x] `POST /api/compras` idempotente por UUID com upsert em transação
- [x] `GET` e `POST /api/produtos`
- [x] `GET` e `POST /api/supermercados`
- [x] `GET` e `POST /api/tipos-lista`

### 6.2 Rotas de item

- [x] `PATCH` e `DELETE /api/compras/[id]`
- [x] `PATCH` e `DELETE /api/produtos/[id]`
- [x] `PATCH` e `DELETE /api/supermercados/[id]`
- [x] `PATCH` e `DELETE /api/tipos-lista/[id]`
- [x] Todas com `import "server-only"` na primeira linha
- [x] Todas com `usuarioAtual()` e retorno 401 sem sessão
- [x] Todas filtrando por `usuarioId` no `where` do Prisma
- [x] Retorno 404 para registro de outro usuário, nunca 403

### 6.3 Pendências de API

- [ ] Criar `GET /api/sincronizacao` em `src/app/api/sincronizacao/route.ts`
- [ ] Devolver cadastros e histórico do usuário logado
- [?] Teste: `POST /api/compras` sem sessão devolve 401
- [?] Teste: `POST /api/compras` com payload inválido devolve 400 e não grava
- [?] Teste: enviar a mesma compra duas vezes cria um registro só
- [?] Teste: id de outro usuário devolve 404

---

## 7. Sincronização

- [x] Fila de compras pendentes em `src/sync/fila.ts` (3 testes)
- [x] Resolução de conflitos em `src/sync/conflitos.ts` (2 testes)
- [ ] Integração da fila com `POST /api/compras`
- [ ] Preencher `salva_em` após envio bem-sucedido
- [ ] Tentativa automática ao abrir com internet
- [ ] Tentativa automática quando a conexão volta (listener de evento `online`)
- [ ] Botão manual de sincronização
- [ ] Tela `/pendentes` em `src/app/(protegido)/pendentes/page.tsx`
- [ ] Listar compras finalizadas sem `salva_em` no Início
- [ ] Download em aparelho novo via `GET /api/sincronizacao`
- [ ] Reconstruir `resumo_precos` após download

---

## 8. Hooks

- [x] `use-compras.ts` (5 testes)
- [x] `use-consulta-reativa.ts` (4 testes)
- [x] `use-itens-compra.ts` (4 testes)
- [x] `use-itens-lista.ts` (5 testes)
- [x] `use-produtos.ts` (4 testes)
- [x] `use-resumo-precos.ts` (3 testes)
- [x] `use-supermercados.ts` (5 testes)
- [x] `use-tipos-lista.ts` (5 testes)
- [x] Confirmado: nenhuma tela chama `abrirBanco` direto, só os hooks

---

## 9. Telas

- [x] `/login`
- [x] `/cadastro`
- [?] `/inicio`
- [?] `/listas` e `/listas/nova`
- [?] `/compras` e `/compras/nova`
- [?] `/compras/[id]/montar`
- [?] `/compras/[id]/comprar`
- [?] `/compras/[id]/fechamento`
- [?] `/historico` e `/historico/[id]`
- [?] `/cadastros`, `/cadastros/produtos`, `/cadastros/supermercados`, `/cadastros/tipos-lista`
- [?] `/comparar`
- [?] `/estatisticas`
- [ ] `/pendentes`
- [?] Regra de entrada por código da compra: `em_montagem` vai para montar, `em_aberto` vai para comprar, `finalizada` fica no detalhe
- [?] Barra inferior com cinco atalhos: Início, Nova compra, Histórico, Comparar, Cadastros
- [?] Toda tela que busca dados trata os quatro estados: carregando, vazio, erro e sucesso

---

## 10. PWA e offline

- [ ] Manifest em `src/app/manifest.ts` ou `public/manifest.webmanifest`
- [ ] Ícones do PWA em `public/`
- [ ] Service worker com Serwist configurado em `next.config.ts`
- [ ] Cache da casca do app
- [ ] Atualização em segundo plano com aviso de versão nova
- [ ] Pedido de armazenamento persistente com `navigator.storage.persist()`
- [ ] Teste de instalação no celular
- [ ] Teste de uso completo em modo avião

---

## 11. Qualidade e infraestrutura

- [x] 171 testes passando em 32 arquivos
- [x] `tsc --noEmit` limpo
- [x] ESLint sem erros (2 warnings de import não usado em `src/app/(protegido)/layout.tsx`)
- [x] Alias `server-only` no `vitest.config.mts`
- [x] Prettier configurado com `formatar:verificar`
- [ ] Resolver 8 vulnerabilidades do `npm audit` sem usar `--force`
- [ ] Aprovar scripts de instalação do Prisma se necessário
- [ ] Decidir destino dos arquivos órfãos: `cookie-sessao.ts`, `codigo-convite.ts`, `codigo-convite.test.ts`, `usuarios/route.ts`
- [ ] Fazer commit do trabalho realizado

---

## 12. Documentação

- [x] `docs/01-requisitos.md`
- [x] `docs/02-navegacao.md`
- [x] `docs/03-modelo-de-dados.md`
- [x] `docs/04-arquitetura.md`
- [x] `docs/05-estrutura-de-pastas.md`
- [x] `docs/metodo-de-trabalho.md`
- [ ] Criar `docs/10-revisao-de-seguranca.md` (Tópico 17 do método)
- [ ] Criar `docs/08-criterios-de-aceitacao.md` (Tópico 19 do método)
- [ ] Atualizar RNF04 nos documentos: hoje diz 50 dias, o código usa 8 horas

---

## 13. Divergências conhecidas

| Item | Documento diz | Código faz |
| --- | --- | --- |
| Duração da sessão | 50 dias (RNF04) | 8 horas em `src/auth.ts` |
| Código de convite | Obrigatório no cadastro | Removido por decisão do usuário |
| Marcador de sessão local | Obrigatório (seção 5.2) | Não existe |
| Tela `/pendentes` | Existe na navegação | Não existe |
| `GET /api/sincronizacao` | Existe na arquitetura | Não existe |
| PWA instalável | Manifest, ícones e service worker | Só SVGs padrão do Next em `public/` |

---

## 14. Próxima etapa recomendada

A próxima etapa é criar o **marcador de sessão local**, porque ele é regra inviolável em três documentos e é o que permite abrir o app sem internet por 50 dias, atendendo ao RNF01 e ao RNF04. Antes disso, alinhar a duração da sessão em `src/auth.ts` para 50 dias, já que os dois andam juntos.

Depois: `GET /api/sincronizacao` e a tela `/pendentes` para fechar o fluxo de sincronização. Por fim, o PWA com manifest, ícones e service worker.