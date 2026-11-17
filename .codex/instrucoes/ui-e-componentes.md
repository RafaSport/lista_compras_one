# Interface e componentes

## Responsabilidade

`src/componentes/` são as peças visuais. Recebem dados por props ou por gancho.
Não conhecem Dexie nem Prisma.

## Limites

- Pode importar de: `ganchos`, `dominio`, `utilitarios`, `tipos`.
- Não importa de: `banco-local`, `servidor`, `sincronizacao`.
- `componentes/ui/` é gerado pelo shadcn. Evite editar; se precisar, envolva em vez
  de alterar o arquivo gerado.

## Mobile-first

A tela principal é usada em pé, no mercado, com uma mão. Isso manda em tudo:

- Alvo de toque mínimo de 44px.
- Ação principal sempre ao alcance do polegar.
- Campo de preço com teclado numérico (`inputMode="decimal"`).
- Nada de tabela larga. Lista vertical.
- Barra inferior fixa com cinco atalhos: Início, Nova compra, Histórico, Comparar,
  Cadastros.

## Padrões de interação

- Editar item, acrescentar item e confirmar ação abrem painel ou diálogo sobre a
  tela atual. Não criam rota nova.
- Botão Comprar fica desabilitado até existir preço válido (RF11).
- Botão Finalizar compra fica desabilitado enquanto houver item pendente e mostra
  quantos faltam (RF15).
- Item comprado aparece esmaecido, no fim da lista, com botão Desfazer e
  confirmação (RF13).
- Indicação de preço subiu/desceu aparece ao informar o valor (RF14).

## Acessibilidade

- Todo botão de ícone tem `aria-label` em português.
- Diálogo de confirmação com foco preso e retorno de foco ao fechar.
- Estado de carregamento anunciado, não só visual.
- Contraste conforme WCAG AA.

## Formatação

Dinheiro e data são formatados em `utilitarios/`, nunca no componente.
Use `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` recebendo
centavos convertidos para reais na hora de exibir.

## Validação

- Teste de componente com Testing Library.
- Teste obrigatório: botão Comprar desabilitado sem preço.
- Teste obrigatório: botão Finalizar desabilitado com item pendente.
- Teste obrigatório: desfazer item devolve o item aos pendentes e reduz o total.
