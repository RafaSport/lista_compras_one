# Estrutura de pastas — Lista de Compras

> Documento 2.2 do roteiro de desenvolvimento.
> Define onde cada tipo de código fica e quem pode usar quem. Segue os documentos `02-navegacao.md` (rotas), `03-modelo-de-dados.md` (dados) e `04-arquitetura.md` (camadas).

---

## 1. Árvore de pastas

```text
lista-compras-novo/
├── docs/                              Documentação do projeto
├── prisma/                            Esquema e migrações do banco do servidor (Fase 7)
├── public/                            Arquivos estáticos: ícones e manifest do PWA (Fase 9)
└── src/
    ├── app/                           Rotas do Next.js (App Router)
    │   ├── (publico)/                 Telas sem login
    │   │   ├── login/
    │   │   └── cadastro/
    │   ├── (protegido)/               Telas que exigem login
    │   │   ├── compras/
    │   │   │   ├── nova/
    │   │   │   └── [id]/
    │   │   │       ├── montar/
    │   │   │       └── comprar/
    │   │   ├── historico/
    │   │   │   └── [supermercadoId]/
    │   │   │       └── [tipoListaId]/
    │   │   ├── comparar/
    │   │   ├── pendentes/
    │   │   └── cadastros/
    │   │       ├── supermercados/
    │   │       └── tipos-lista/
    │   │           └── [tipoListaId]/
    │   │               └── itens/
    │   └── api/                       Endpoints do servidor
    │       ├── auth/
    │       ├── cadastro/
    │       ├── compras/
    │       └── sincronizacao/
    ├── componentes/                   Peças visuais em React
    │   ├── ui/                        Peças base do shadcn/ui
    │   ├── layout/                    Barra inferior, cabeçalhos e estruturas de tela
    │   ├── compras/
    │   ├── historico/
    │   └── cadastros/
    ├── dominio/                       Regras de negócio puras (cálculos)
    ├── banco-local/                   Dexie: banco do aparelho
    │   └── repositorios/              Funções de cadastrar, listar, editar e excluir
    ├── esquemas/                      Validações com Zod
    ├── tipos/                         Tipos TypeScript compartilhados
    ├── ganchos/                       Hooks do React
    ├── sincronizacao/                 Lado do aparelho: fila, envio e download
    ├── servidor/                      Código que roda só no servidor (Prisma, Auth.js)
    └── utilitarios/                   Funções auxiliares (dinheiro, datas, UUID)
```

**Sobre os nomes entre parênteses e colchetes**

- `(publico)` e `(protegido)` são **grupos de rotas**: organizam as pastas, mas **não aparecem na URL**. A tela de login continua em `/login`.
- `[id]`, `[supermercadoId]` e `[tipoListaId]` são **rotas dinâmicas**: o valor vem da URL.
- As rotas desta árvore correspondem às do documento `02-navegacao.md`. A tela de detalhe `/compras/[id]` fica em `compras/[id]/page.tsx`.

---

## 2. O que cada pasta guarda

| Pasta            | Guarda                             | Regra                                                                                                                                            |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app`            | Rotas e composição das telas       | Telas **finas**: montam componentes e chamam ganchos. Sem cálculo de preço e sem acesso direto ao Dexie ou ao Prisma.                            |
| `componentes`    | Peças visuais                      | Não conhecem Dexie nem Prisma. Recebem dados por props ou por ganchos.                                                                           |
| `componentes/ui` | Peças base (botão, diálogo, campo) | Geradas pelo shadcn/ui. Evitar editar muito.                                                                                                     |
| `dominio`        | Regras de negócio                  | Funções **puras**, sem React, Dexie ou Prisma: conversão de unidades, preço por unidade base, último valor, média e total. Testadas com Vitest.  |
| `banco-local`    | Banco do aparelho (Dexie)          | Definição das tabelas e **repositórios**. As telas nunca falam com o Dexie diretamente.                                                          |
| `esquemas`       | Validações Zod                     | O mesmo esquema valida o formulário e a API.                                                                                                     |
| `tipos`          | Tipos TypeScript                   | Unidades, situações da compra e do item, entidades.                                                                                              |
| `ganchos`        | Hooks React                        | Ligam as telas ao banco local, com leitura reativa.                                                                                              |
| `sincronizacao`  | Envio e download                   | Fila de compras pendentes, `Salvar no banco` e carga em aparelho novo.                                                                           |
| `servidor`       | Código só do servidor              | Prisma, Auth.js e regras da API. **Nunca** importado por componente do cliente. Usar `import "server-only"` nos arquivos.                        |
| `utilitarios`    | Funções auxiliares                 | Formatar dinheiro e datas, gerar UUID. Também guarda o `cn.ts`, que reexporta a função `cn` (junção de classes do Tailwind) para o nosso código. |
| `prisma`         | Esquema do banco                   | `schema.prisma` e migrações.                                                                                                                     |

---

## 3. Quem pode importar quem

| Pasta           | Pode importar de                                                     |
| --------------- | -------------------------------------------------------------------- |
| `tipos`         | Ninguém                                                              |
| `dominio`       | `tipos`                                                              |
| `utilitarios`   | `tipos`                                                              |
| `esquemas`      | `tipos`, `dominio`                                                   |
| `banco-local`   | `tipos`, `dominio`, `utilitarios`                                    |
| `sincronizacao` | `banco-local`, `esquemas`, `tipos`                                   |
| `ganchos`       | `banco-local`, `sincronizacao`, `dominio`, `tipos`, `utilitarios`    |
| `componentes`   | `ganchos`, `dominio`, `utilitarios`, `tipos`                         |
| `servidor`      | `tipos`, `esquemas`, `dominio`                                       |
| `app`           | Todas, exceto que **componentes do cliente** não importam `servidor` |

A ideia é que a regra "desce": telas dependem de componentes, que dependem de ganchos, que dependem de dados e regras. O `dominio` fica no fundo e não depende de nada que seja de React ou de banco, o que permite testar os cálculos sozinhos.

---

## 4. Convenções de nomes

| Item                | Padrão                                                                 | Exemplo                               |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| Idioma              | Português para pastas, arquivos, funções, variáveis, atributos e tipos | `calcularPrecoPorUnidadeBase`         |
| Pastas              | minúsculas, com hífen quando houver mais de uma palavra                | `banco-local`, `tipos-lista`          |
| Arquivos de lógica  | minúsculas com hífen                                                   | `calcular-preco-unidade-base.ts`      |
| Componentes React   | PascalCase, no mesmo nome do arquivo                                   | `CartaoItemCompra.tsx`                |
| Funções e variáveis | camelCase, funções com verbo no infinitivo                             | `finalizarCompra`, `valorTotal`       |
| Tipos               | PascalCase                                                             | `ItemCompra`, `SituacaoCompra`        |
| Testes              | `nome.test.ts` ao lado do arquivo testado                              | `calcular-preco-unidade-base.test.ts` |

**Exceção obrigatória:** os arquivos especiais do Next.js têm nome fixo em inglês e não podem ser traduzidos: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx` e `not-found.tsx`.

---

## 5. Ajustes previstos nos próximos passos

| Passo       | O que acontece com a estrutura                                                                                                                                                                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.3 (feito) | O shadcn/ui foi configurado para gerar as peças em `src/componentes/ui`, e a função auxiliar `cn` (junção de classes do Tailwind) ficou em `src/utilitarios/cn.ts`, que apenas reexporta a função `cn` do pacote `cn`, instalado pelo shadcn. Os arquivos gerados pelo shadcn mantêm nomes em inglês, porque são atualizados pelo CLI. |
| 2.4 (feito) | Entraram os arquivos `.prettierrc.json` e `.prettierignore` na raiz e os scripts `formatar`, `formatar:verificar`, `tipos` e `verificar` no `package.json`.                                                                                                                                                                            |
| 4.1         | A página inicial padrão do Next (`src/app/page.tsx`) será removida e substituída por `src/app/(protegido)/page.tsx`, para não haver duas páginas na rota `/`. O layout com a barra inferior entra em `(protegido)/layout.tsx`.                                                                                                         |
| 7.1         | O esquema do Prisma entra em `prisma/`.                                                                                                                                                                                                                                                                                                |
| 7.3         | O arquivo de proteção de rotas fica diretamente em `src/` (`middleware.ts` ou `proxy.ts`, conforme a versão do Next).                                                                                                                                                                                                                  |
| 9.1         | Ícones e manifest do PWA entram em `public/`.                                                                                                                                                                                                                                                                                          |

Os arquivos `.gitkeep` que aparecem nas pastas vazias existem só para o Git guardá-las. Podem ser apagados à medida que as pastas recebem arquivos de verdade.
