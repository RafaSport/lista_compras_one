# Requisitos — Lista de Compras

> Documento 1.1 do roteiro de desenvolvimento (versão revisada).
> Aplicativo **pessoal** de lista de compras, com funcionamento **offline**, histórico de preços por supermercado e estatísticas simples.

---

## 1. Visão geral

O sistema permite cadastrar supermercados e tipos de lista (limpeza, alimentação etc.), montar a lista em casa escolhendo os itens e, depois, fazer a compra no mercado registrando o preço de cada item. Com o histórico, o app mostra o **último valor** e o **valor médio** de cada produto já na hora de escolher os itens em casa, para que seja possível perceber se o preço subiu ou desceu. Também compara supermercados pelo **preço por unidade de medida**.

A compra é feita **offline**, no aparelho. Ao finalizar, o usuário aperta um botão para **salvar no banco de dados**, e o histórico e as estatísticas são gerados a partir dos dados salvos.

---

## 2. Fluxo da compra

### Etapa 1 — Em casa (montar a lista)
1. O usuário escolhe o **supermercado** e o **tipo de lista**.
2. Seleciona os itens da lista. Cada item mostra o **último valor** e o **valor médio** naquele supermercado.
3. Ao fechar a lista, ela se torna uma **compra em aberto**.

### Etapa 2 — No mercado (fazer a compra)
1. O usuário abre a compra em aberto, com os itens escolhidos em casa.
2. Pode **acrescentar** um item cadastrado que não tinha escolhido, **alterar a quantidade** e **editar a unidade de medida**. Se precisar de um produto que ainda não existe no cadastro, pode **pausar a compra**, cadastrá-lo e voltar.
3. O botão **Comprar** só é ativado depois que o **preço** é informado.
4. Ao clicar em Comprar, o sistema calcula **quantidade × valor unitário**, soma ao **total** da compra e o item vai para o final da tela, na área de **itens comprados**, com aparência **esmaecida**.
5. Um item comprado pode ser **desfeito** (com confirmação): ele volta para a lista de pendentes e seu valor sai do total.
6. Itens que não serão comprados podem ser **excluídos** da compra.

### Etapa 3 — Depois do mercado
1. O usuário **finaliza** a compra. O botão só fica ativo quando **todos os itens** da compra estão comprados.
2. Aperta **Salvar no banco** (imediatamente ou quando houver internet).

### Situações da compra
| Situação | Significado |
|----------|-------------|
| Em montagem | A lista está sendo escolhida em casa. |
| Em aberto | A lista foi fechada e está pronta para o mercado. |
| Finalizada | A compra foi concluída no mercado. |
| Salva | A compra foi enviada ao banco de dados. |

### Situações do item
| Situação | Significado |
|----------|-------------|
| Pendente | Ainda não foi comprado. |
| Comprado | Preço informado e botão Comprar acionado. O item fica na área de itens comprados e pode ser desfeito. |

---

## 3. Requisitos funcionais

### Cadastros

| Código | Requisito |
|--------|-----------|
| RF01 | O usuário pode cadastrar, editar e excluir **supermercados** (ex.: Assaí, Atacadão, Novo). |
| RF02 | O usuário pode cadastrar, editar e excluir **tipos de lista** (ex.: limpeza, alimentação). Os tipos são **únicos** e valem para qualquer supermercado. |
| RF03 | O usuário pode cadastrar, editar e excluir **itens da lista** dentro de um tipo de lista, informando: produto, quantidade padrão, unidade de medida padrão, marca (opcional) e observação (opcional). |

### Montagem da lista (em casa)

| Código | Requisito |
|--------|-----------|
| RF04 | Para montar uma lista, o usuário escolhe primeiro o **supermercado** cadastrado e depois o **tipo de lista**, e então seleciona os itens. |
| RF05 | Ao selecionar os itens, cada um exibe o **último valor** e o **valor médio** do produto **no supermercado escolhido**. Se não houver histórico, exibe "sem histórico". |
| RF06 | Ao fechar a lista, ela se torna uma **compra em aberto**. |

### Compra (no mercado)

| Código | Requisito |
|--------|-----------|
| RF07 | O usuário pode abrir a compra em aberto, que mostra os itens escolhidos em casa. |
| RF08 | O usuário pode **acrescentar** à compra um item que não foi escolhido em casa, mas **somente produtos já cadastrados**. |
| RF09 | O usuário pode **pausar a compra** para ir à área de cadastro, cadastrar um novo item e, ao **voltar à compra**, encontrá-lo disponível para acrescentar. |
| RF10 | O usuário pode alterar, em cada item: **quantidade**, **unidade de medida**, embalagem, conteúdo da embalagem, marca e observação. Essas alterações **não mudam o item padrão** da lista. O usuário também pode **excluir** da compra um item **pendente** (um item comprado precisa ser desfeito antes). |
| RF11 | O botão **Comprar** só fica ativo depois que o usuário informa o **preço**. |
| RF12 | Ao acionar Comprar, o sistema calcula o valor do item (**quantidade × valor unitário**), **soma ao total** da compra e move o item para a área de **itens comprados**, no final da tela e **esmaecido**. |
| RF13 | O usuário pode **desfazer a compra de um item**, mediante **confirmação**. O item volta para a lista de itens pendentes, seu valor é **retirado do total** e ele pode ser alterado ou excluído como qualquer outro item. |
| RF14 | O sistema indica se o preço informado **subiu ou desceu** em relação ao último valor e à média. |
| RF15 | O usuário pode **finalizar a compra**, mas o botão **só fica ativo quando todos os itens da compra estiverem comprados**. Itens que não serão comprados devem ser **excluídos** da compra antes. |

### Consulta e comparação

| Código | Requisito |
|--------|-----------|
| RF16 | O usuário navega pelo histórico na ordem: **supermercado → tipo de lista → compras (com valor total) → itens**. Em cada item aparecem o **valor comprado** e o **preço médio**. |
| RF17 | O usuário pode ver os **produtos de cada supermercado** com o preço médio por unidade de medida, com destaque para o supermercado **mais em conta** em cada produto. |

### Dados e acesso

| Código | Requisito |
|--------|-----------|
| RF18 | Depois de finalizada, a compra pode ser enviada ao banco de dados por um botão **"Salvar no banco"**. Se não houver internet, a compra fica **pendente** e é enviada quando a conexão voltar. |
| RF19 | O sistema guarda cada compra feita com o **valor de cada item**, o **valor total** e o **supermercado**. |
| RF20 | O sistema possui **login**. Sem estar logado, o usuário não acessa nenhuma página do aplicativo, exceto as telas de login e de cadastro. |
| RF21 | O usuário pode **criar o seu usuário** informando **nome** e **sobrenome**. O login é gerado a partir deles (RN12). Se já existir um usuário com esse login, o sistema pede um **sobrenome diferente**. A senha e a restrição de quem pode se cadastrar estão em confirmação no documento `04-arquitetura.md`. |
| RF22 | O usuário pode **excluir uma compra** em montagem, em aberto ou finalizada. A exclusão de uma compra finalizada exige **confirmação**. |

---

## 4. Regras de negócio

| Código | Regra |
|--------|-------|
| RN01 | **Preço por unidade de medida** = preço da embalagem ÷ conteúdo da embalagem, convertido para a **unidade base**: litro (volume), quilo (peso) ou unidade. Ex.: 500 ml e 0,5 L são equivalentes. |
| RN02 | O **último valor** e o **valor médio** são calculados por **produto + supermercado**, usando apenas compras **finalizadas**. |
| RN03 | O supermercado **mais em conta** é o que tem o **menor preço médio por unidade de medida**. Ex.: 5 L por R$ 9 (R$ 1,80/L) é mais barato que 2 L por R$ 4 (R$ 2,00/L). |
| RN04 | O **valor do item** é a **quantidade** multiplicada pelo **valor unitário** informado, e o **total da compra** é a soma dos itens comprados. Ao desfazer um item comprado, o valor dele é retirado do total. |
| RN05 | O item padrão da lista **nunca é alterado** por mudanças feitas durante uma compra. |
| RN06 | A **marca é apenas informativa** e não entra no cálculo de preços. O produto é cadastrado de forma **genérica** (ex.: "Desinfetante"). |
| RN07 | Marca e observação são **opcionais** no cadastro do item. |
| RN08 | Cada compra tem um **identificador único (UUID)** gerado no aparelho, para que o mesmo envio repetido não crie compras duplicadas no banco. |
| RN09 | Cada usuário acessa **somente os próprios dados**. |
| RN10 | Pode haver **mais de uma compra em aberto ao mesmo tempo** (ex.: uma para cada supermercado). |
| RN11 | Uma compra só pode ser finalizada se tiver **pelo menos um item** e **todos os itens comprados**. |
| RN12 | O **login** é formado por `nome.sobrenome`, **tudo em minúsculas**, sem acentos e sem espaços (ex.: Rafael + Guedes = `rafael.guedes`). O login é **único**. |
| RN13 | Supermercados, tipos de lista e produtos que **já têm histórico** não são apagados: são **desativados** e somem das escolhas novas, mas o histórico continua intacto. Cadastros sem nenhuma compra podem ser excluídos de verdade. |

---

## 5. Requisitos não funcionais

| Código | Requisito |
|--------|-----------|
| RNF01 | **Offline-first:** montar a lista, fazer e finalizar compras, consultar o histórico e ver último valor e média devem funcionar **sem internet**. Os dados ficam no IndexedDB do aparelho. |
| RNF02 | **PWA:** o app pode ser instalado no celular e deve ser pensado primeiro para telas pequenas (mobile-first). |
| RNF03 | **Proteção de páginas:** todas as rotas do aplicativo exigem sessão ativa. Sem login, o usuário é redirecionado para a tela de login. As páginas protegidas não devem ser mantidas em cache de forma que fiquem visíveis a quem não está logado. |
| RNF04 | **Sessão e uso offline:** a sessão permanece válida no aparelho por **50 dias**, renovada a cada acesso com internet, para permitir o uso sem conexão entre uma compra e outra. |
| RNF05 | **Tecnologias:** TypeScript, React, Next.js (App Router), Tailwind CSS, shadcn/ui, Dexie (IndexedDB), PostgreSQL, Prisma ou Drizzle, Auth.js, Zod, React Hook Form, TanStack Query, Vitest. |
| RNF06 | **Simplicidade:** o sistema prioriza o fluxo rápido de compra, com poucos toques por item. |
| RNF07 | **Uso pessoal:** o sistema é usado pelo dono e, no máximo, por um parente próximo. |

---

## 6. Estatísticas

As estatísticas são **simples**: o sistema guarda cada compra com o valor de cada item, o valor total e o supermercado, e em cada item mostra o **preço médio** e o **valor comprado**. Não há gráficos nesta versão.

---

## 7. Decisões pendentes

As decisões sobre login, sessão, logout e sincronização estão no documento `04-arquitetura.md`.
