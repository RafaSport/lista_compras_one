# Método de Trabalho — Desenvolvimento Guiado Passo a Passo

Documento de referência para iniciar novos projetos. Descreve a ordem de
construção, o que validar em cada etapa e as decisões que evitam retrabalho.

Use este arquivo como base: ao iniciar um projeto novo, forneça-o junto com a
descrição do sistema. Ajuste o que não se aplicar.

---

## Princípios gerais

- **Fundação antes de telas.** Banco, esquemas de validação, autenticação e
  roteamento vêm antes de qualquer interface. Erro nessa camada contamina tudo.
- **Um arquivo por vez.** Cada arquivo é entregue, colado, validado e só então
  o próximo começa. Evita erro em cascata e facilita localizar a causa.
- **Validar antes de commitar.** Nenhum commit sem `npx tsc --noEmit` limpo.
- **Commit por etapa concluída.** Mensagem descritiva no imperativo, em
  português, com prefixo convencional (`feat`, `fix`, `chore`, `docs`, `test`).
- **Confirmar versão antes de usar biblioteca.** A sintaxe muda entre versões
  maiores. `npm ls <pacote>` antes de escrever código com ela.
- **Registrar armadilhas.** Todo erro de versão encontrado vira uma linha no
  `AGENTS.md`, para não se repetir.
- **Testar a regra quando ela nasce.** Regra de cálculo ou validação é testada
  no mesmo passo em que é escrita, nunca depois das telas.

---

## Tópico 1 — Levantamento e especificação

### Objetivo

Transformar a ideia em requisitos verificáveis antes de escrever código.

### Passos

1. Descrever o problema, o usuário e o resultado esperado em linguagem simples.
2. Listar as funcionalidades em formato de ações do usuário ("cadastrar
   supermercado", "comparar preço por litro").
3. Definir o que está fora do escopo. Tão importante quanto o que entra.
4. Mapear as entidades do domínio e seus relacionamentos.
5. Definir as regras de negócio que não são óbvias (cálculos, restrições,
   unicidade, permissões).
6. Listar as telas e o fluxo de navegação entre elas.
7. Registrar as restrições técnicas: offline, dispositivo alvo, volume de
   dados, integrações externas.

### Entregáveis

- `docs/01-visao-geral.md`
- `docs/02-requisitos.md`
- `docs/03-regras-de-negocio.md`
- `docs/07-fluxos.md`

### Validação

Cada requisito deve ser testável. Se não dá para escrever um teste ou um passo
manual de verificação, o requisito está vago.

---

## Tópico 2 — Decisões de arquitetura e stack

### Objetivo

Escolher tecnologia com base nos requisitos, não em preferência.

### Passos

1. Definir a arquitetura em uma frase (ex: "PWA offline-first com sincronização
   eventual para servidor Postgres").
2. Escolher a stack e registrar o motivo de cada escolha.
3. Definir a estrutura de pastas com a responsabilidade de cada uma.
4. Estabelecer a regra de dependência entre camadas (quem pode importar quem).
5. Decidir onde ficam as regras puras, isoladas de I/O.
6. Documentar o modelo de dados completo.

### Entregáveis

- `docs/04-arquitetura.md`
- `docs/05-modelo-de-dados.md`
- `AGENTS.md` com a seção de estrutura de pastas

### Validação

A regra de dependência deve ser verificável: se `dominio/` importa de
`servidor/`, a arquitetura está violada.

---

## Tópico 3 — Preparação do repositório

### Objetivo

Deixar o projeto pronto para receber código, com ferramentas configuradas.

### Passos

1. Criar o projeto com o gerador oficial do framework.
2. Configurar o `.gitignore` e confirmar que `.env` está ignorado
   (`git check-ignore -v .env`).
3. Instalar as dependências de produção e de desenvolvimento.
4. Configurar variáveis de ambiente em `.env` e documentar em `.env.example`.
5. Configurar o ORM e o arquivo de configuração dele.
6. Rodar a primeira migração e gerar o client.
7. Verificar que `npx tsc --noEmit` passa no projeto vazio.
8. Fazer o commit inicial da configuração.

### Entregáveis

- `package.json`, `.gitignore`, `.env.example`
- Arquivo de configuração do ORM
- Primeiro commit

### Validação

`npx tsc --noEmit` limpo e `git status` sem nada pendente.

---

## Tópico 4 — Modelagem de dados

### Objetivo

Definir o banco antes de escrever qualquer consulta.

### Passos

1. Escrever o schema com todas as entidades, campos, tipos e relações.
2. Definir índices e restrições de unicidade.
3. Definir a estratégia de exclusão (cascata, restrição, soft delete).
4. Criar a migração com nome descritivo.
5. Rodar a migração e depois o gerador do client.
6. Abrir a interface do banco e conferir as tabelas criadas.
7. Fazer o commit do schema e da migração.

### Entregáveis

- `prisma/schema.prisma` (ou equivalente)
- `prisma/migrations/`

### Validação

As tabelas existem no banco, com os tipos e relações corretos. O client foi
gerado depois da migração.

---

## Tópico 5 — Validação compartilhada

### Objetivo

Uma única fonte de verdade para as regras de entrada de dados.

### Passos

1. Criar os schemas de validação por entidade, em pasta compartilhada.
2. Centralizar constantes e enums do domínio em um arquivo comum.
3. Garantir que o mesmo schema é usado no formulário e na rota de API.
4. Escrever as mensagens de erro em português, claras para o usuário final.
5. Validar com `npx tsc --noEmit`.

### Entregáveis

- `src/esquemas/` com um arquivo por entidade e um arquivo comum

### Validação

Nenhuma regra de validação duplicada entre cliente e servidor.

---

## Tópico 6 — Camada de acesso ao banco (servidor)

### Objetivo

Isolar o ORM e as checagens de permissão em um só lugar.

### Passos

1. Criar o client do ORM com a configuração de conexão.
2. Criar os helpers de sessão: obter usuário atual e exigir usuário.
3. Criar as checagens de propriedade por entidade (o registro pertence ao
   usuário logado?).
4. Definir a convenção de resposta: registro de outro usuário responde 404,
   nunca 403.
5. Validar com `npx tsc --noEmit`.

### Entregáveis

- `src/servidor/prisma.ts`
- `src/servidor/sessao.ts`

### Validação

Toda rota futura consegue usar `exigirUsuario()` e as checagens de dono sem
reescrever lógica.

---

## Tópico 7 — Autenticação

### Objetivo

Login funcional com sessão persistida e rotas protegidas.

### Passos

1. Configurar o provedor de autenticação com credenciais.
2. Validar a entrada do login com o schema compartilhado.
3. Comparar a senha com hash, nunca em texto puro.
4. Configurar a estratégia de sessão e os callbacks de token.
5. Declarar os tipos extras da sessão para o TypeScript.
6. Criar a rota de handler da autenticação.
7. Criar o middleware de proteção de rotas, com lista de rotas públicas.
8. Excluir do matcher do middleware as rotas de auth e os assets estáticos.
9. Validar com `npx tsc --noEmit` e testar o redirecionamento manualmente.

### Entregáveis

- `src/auth.ts`
- `src/tipos/next-auth.d.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/proxy.ts` (ou `middleware.ts`, conforme a versão do framework)

### Validação

Rota privada sem sessão redireciona para o login. Rota pública com sessão
redireciona para a home. Sem loop de redirecionamento.

---

## Tópico 8 — Padronização visual

### Objetivo

Definir tokens de design antes de criar componentes.

### Passos

1. Escolher a paleta e o tema (dark, light ou ambos).
2. Definir os tokens em CSS: cores, raios, tipografia, foco.
3. Mapear os tokens para as classes do framework de estilo.
4. Criar o utilitário de composição de classes (`cn`).
5. Definir a regra de foco visível e o esquema de cor do documento.
6. Validar com `npx tsc --noEmit`.

### Entregáveis

- `src/app/globals.css`
- `src/lib/utilitarios.ts`

### Validação

Um componente consegue usar `bg-background`, `text-foreground`,
`border-border` e `bg-primary` sem definir cor própria.

---

## Tópico 9 — Biblioteca de componentes

### Objetivo

Componentes genéricos, reutilizáveis e independentes de página.

### Ordem de construção

Do mais simples ao mais composto. Um componente só importa componentes de
camada inferior.

### Passos

1. Componentes atômicos: botão, campo de entrada, rótulo, mensagem de feedback,
   link de texto, ícone.
2. Componentes de superfície: cartão, separador, esqueleto de carregamento.
3. Componentes de sobreposição: diálogo, gaveta, aviso flutuante (toast).
4. Componentes de estrutura: cabeçalho, rodapé, barra lateral, contêiner de
   página.
5. Componentes compostos: formulário genérico que recebe campos e botão.
6. Validar com `npx tsc --noEmit` a cada componente.

### Regras de componente

- Toda variação visual vem por parâmetro (`variante`), nunca por cópia do
  componente.
- Aceitar `className` para sobrescrever o padrão quando necessário.
- Acessibilidade obrigatória: rótulo ligado ao campo, `aria-invalid` em erro,
  `role="alert"` na mensagem, foco visível.
- Nenhum componente conhece a página onde é usado.

### Entregáveis

- `src/componentes/ui/` (atômicos e de superfície)
- `src/componentes/formulario/` (campos e formulário)

### Validação

Cada componente renderiza isolado e aceita as variações previstas.

---

## Tópico 10 — Estados de interface

### Objetivo

Padronizar carregamento, vazio, erro e sucesso antes de construir as telas.

### Passos

1. Criar o componente de esqueleto de carregamento, com variações por tipo de
   conteúdo (linha, cartão, lista).
2. Criar o componente de estado vazio, com título, descrição e ação opcional.
3. Criar o componente de erro, com mensagem, ícone e botão de repetir.
4. Criar o componente de aviso flutuante (toast) para confirmação de ação.
5. Definir a regra: toda tela que busca dados trata os quatro estados.
6. Validar com `npx tsc --noEmit`.

### Entregáveis

- `src/componentes/estados/esqueleto.tsx`
- `src/componentes/estados/vazio.tsx`
- `src/componentes/estados/erro.tsx`
- `src/componentes/ui/toast.tsx`

### Validação

Nenhuma tela privada é construída sem que os quatro estados estejam
disponíveis para uso.

---

## Tópico 11 — Páginas públicas

### Objetivo

Entrada do sistema: login e cadastro.

### Passos

1. Criar o layout das rotas públicas, sem navegação.
2. Criar o formulário de login usando os componentes do Tópico 9.
3. Criar o formulário de cadastro com as regras do domínio.
4. Tratar erro de credencial com mensagem genérica (não revelar qual campo
   errou).
5. Preservar o destino após o login (parâmetro de retorno).
6. Validar com `npx tsc --noEmit` e testar os dois fluxos manualmente.

### Entregáveis

- `src/app/(publico)/layout.tsx`
- `src/app/(publico)/entrar/page.tsx`
- `src/app/(publico)/cadastro/page.tsx`
- Componentes de formulário específicos

### Validação

Login com credencial válida entra. Credencial inválida mostra erro. Cadastro
cria usuário e permite login em seguida.

---

## Tópico 12 — Regras de domínio e testes unitários

### Objetivo

Implementar e testar as regras de negócio puras antes de usá-las nas telas.

### Passos

1. Implementar cada regra pura em `dominio/`, sem I/O e sem dependência de
   framework.
2. Escrever o teste no mesmo passo em que a regra é escrita, não depois.
3. Cobrir os casos de borda: divisão por zero, valor negativo, unidade
   incompatível, arredondamento. Em cálculo monetário, o arredondamento segue a
   regra do `AGENTS.md`: valor persistido é inteiro em centavos, com `Math.round`;
   o cálculo interno pode usar precisão total. Ver `.codex/instrucoes/dominio.md`.
4. Rodar a suíte e confirmar que passa.
5. Fazer o commit da regra junto com o teste.

### Entregáveis

- `src/dominio/` com os arquivos de regra e os testes ao lado
- Configuração do runner de testes

### Validação

Suíte verde. Toda regra de cálculo tem teste cobrindo o caminho normal e os
casos de borda.

---

## Tópico 13 — Camada local (offline)

### Objetivo

Permitir uso sem internet, com sincronização posterior.

### Passos

1. Definir o banco local com as tabelas, índices e chaves.
2. Definir a estratégia de identificação (IDs gerados no cliente, para não
   depender do servidor na criação).
3. Definir os campos de controle de sincronização em cada registro (versão,
   estado, data de atualização, marcação de exclusão).
4. Criar um repositório local por entidade, com as mesmas operações do
   servidor.
5. Implementar a fila de operações pendentes, com ordem de envio e nova
   tentativa em caso de falha.
6. Definir a regra de resolução de conflito (última escrita vence, ou regra
   explícita por entidade).
7. Tratar falha parcial: se uma operação da fila falhar, as seguintes não
   podem ser perdidas.
8. Implementar o versionamento do banco local: cada mudança de schema recebe
   uma versão e uma função de migração dos dados existentes.
9. Escrever testes com banco local em memória.

### Entregáveis

- `src/local/banco.ts`
- `src/local/repositorios/`
- `src/local/sincronizacao/` (fila, conflito, versionamento)

### Validação

Criar um registro sem internet, recarregar a página e o registro continuar lá.
Ao voltar a conexão, o registro chega ao servidor. Atualizar o schema local
preserva os dados existentes.

---

## Tópico 14 — Rotas de API

### Objetivo

Expor as operações do servidor com validação e autorização.

### Passos

1. Criar uma rota por recurso, seguindo o padrão do framework.
2. Toda rota começa por `exigirUsuario()`.
3. Validar o corpo com o schema compartilhado.
4. Verificar propriedade do registro antes de ler ou escrever.
5. Retornar códigos corretos: 201 ao criar, 204 ao excluir, 404 para registro
   inexistente ou de outro usuário, 422 para validação.
6. Nunca retornar o hash da senha nem dados internos.
7. Validar com `npx tsc --noEmit` e testar cada verbo.

### Entregáveis

- `src/app/api/<recurso>/route.ts`
- `src/app/api/<recurso>/[id]/route.ts`

### Validação

Requisição sem sessão responde 401. Requisição com id de outro usuário
responde 404. Corpo inválido responde 422.

---

## Tópico 15 — Telas privadas

### Objetivo

Interface principal do sistema, atrás da autenticação.

### Passos

1. Criar o layout privado com navegação.
2. Criar a tela inicial com o resumo do estado atual.
3. Criar as telas de cadastro (listagem, criação, edição, exclusão).
4. Criar as telas de operação principal, uma por fluxo.
5. Aplicar os quatro estados de interface (Tópico 10) em toda tela que busca
   dados.
6. Confirmar ações destrutivas antes de executar.
7. Validar com `npx tsc --noEmit` e percorrer cada fluxo manualmente.

### Entregáveis

- `src/app/(privado)/layout.tsx`
- Uma pasta por área funcional, com `page.tsx` e componentes próprios

### Validação

Todo fluxo do Tópico 1 tem uma tela correspondente e funciona ponta a ponta.

---

## Tópico 16 — Testes de integração

### Objetivo

Validar a integração entre camadas, não regras isoladas.

### Passos

1. Testar os repositórios locais com banco em memória.
2. Testar as rotas de API com casos de autorização: sem sessão, sessão de
   outro usuário, corpo inválido.
3. Testar o fluxo completo de sincronização: criar offline, reconectar,
   confirmar no servidor.
4. Testar a migração do banco local entre versões.
5. Rodar a suíte completa.

### Entregáveis

- Testes de API ao lado das rotas
- Testes de sincronização em `src/local/sincronizacao/`

### Validação

Suíte verde. Nenhum caso de autorização sem teste.

---

## Tópico 17 — Revisão de segurança

### Objetivo

Confirmar que o sistema não expõe dados nem credenciais antes de publicar.

### Passos

1. Confirmar que `.env` nunca foi commitado: `git log --all -- .env`.
2. Percorrer cada rota de API e confirmar que toda leitura e escrita valida
   propriedade do registro.
3. Confirmar que nenhuma resposta inclui hash de senha, token ou dado interno.
4. Confirmar que mensagens de erro não revelam se um e-mail existe ou qual
   campo falhou no login.
5. Confirmar que nenhum segredo está no código: buscar por chaves e senhas
   literais.
6. Confirmar que as dependências não têm vulnerabilidade crítica:
   `npm audit`.
7. Confirmar que o `.gitignore` cobre `.env`, `node_modules` e artefatos de
   build.

### Entregáveis

- Checklist preenchido em `docs/10-revisao-de-seguranca.md`

### Validação

Todos os itens confirmados. Qualquer item pendente bloqueia a publicação.

---

## Tópico 18 — PWA e publicação

### Objetivo

Instalável no celular e funcional offline.

### Passos

1. Criar o manifesto com nome, ícones, cores e modo de exibição.
2. Configurar o service worker com as estratégias de cache por tipo de
   recurso.
3. Definir o que é cacheado antecipadamente e o que é cacheado sob demanda.
4. Testar a instalação no dispositivo alvo.
5. Testar o uso completo em modo avião.
6. Rodar o build de produção e verificar os avisos.
7. Publicar e testar no ambiente real.

### Entregáveis

- `src/app/manifest.ts`
- Configuração do service worker
- Ícones

### Validação

App instala no celular. Abre sem internet. Dados locais persistem após fechar.

---

## Tópico 19 — Fechamento

### Objetivo

Conferir que tudo o que foi especificado foi entregue.

### Passos

1. Percorrer a lista de requisitos do Tópico 1 e marcar o que está pronto.
2. Percorrer os critérios de aceitação e verificar um por um.
3. Rodar `npx tsc --noEmit`, `npm run lint` e a suíte de testes.
4. Rodar o build de produção.
5. Revisar o `AGENTS.md` e atualizar as armadilhas encontradas.
6. Registrar as pendências conhecidas e o que ficou fora do escopo.

### Entregáveis

- `docs/08-criterios-de-aceitacao.md` preenchido
- Lista de pendências

### Validação

Nenhum requisito sem resposta: pronto, adiado com justificativa, ou fora do
escopo declarado.

---

## Convenções de commit

| Prefixo    | Uso                                            |
| ---------- | ---------------------------------------------- |
| `feat`     | nova funcionalidade ou arquivo novo de produto |
| `fix`      | correção de comportamento errado               |
| `chore`    | configuração, dependência, ferramenta          |
| `docs`     | documentação e instruções                      |
| `test`     | teste novo ou ajuste de teste                  |
| `refactor` | mudança interna sem alterar comportamento      |

Mensagem no imperativo, em português, minúscula, sem ponto final.

---

## Checklist rápido por etapa

Antes de considerar uma etapa concluída:

- [ ] `npx tsc --noEmit` passa
- [ ] `npm run lint` passa sem erro novo
- [ ] O comportamento foi testado manualmente ou por teste
- [ ] Nenhum `console.log` esquecido
- [ ] Nenhum segredo no código
- [ ] Commit feito com mensagem descritiva
