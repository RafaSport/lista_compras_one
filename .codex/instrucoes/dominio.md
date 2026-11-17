# Domínio — cálculos e regras puras

## Responsabilidade

`src/dominio/` guarda as regras de negócio que não dependem de React, Dexie,
Prisma ou rede. Funções puras: entram valores, saem valores. Sem efeito colateral,
sem `async`, sem `Date.now()` escondido (receba a data como parâmetro).

## Limites

- Pode importar de: `tipos`.
- Não pode importar de: `banco-local`, `ganchos`, `componentes`, `servidor`,
  `sincronizacao`, `utilitarios`, `esquemas`.
- Não formate dinheiro para exibição. Formatar é papel de `utilitarios`.
- Não acesse `localStorage`, `window` ou `navigator`.

## O que fica aqui

| Arquivo | Função |
|---------|--------|
| `converter-unidade.ts` | Converte `ml`→`L` e `g`→`kg` para a unidade base. |
| `calcular-preco-unidade-base.ts` | RN01: preço por litro, quilo ou unidade. |
| `calcular-valor-item.ts` | RN04: quantidade × valor unitário. |
| `calcular-total-compra.ts` | RN04: soma dos itens comprados. |
| `calcular-ultimo-e-media.ts` | RN02: último valor e média por produto+supermercado. |
| `comparar-supermercados.ts` | RN03: menor preço médio por unidade base. |
| `pode-finalizar-compra.ts` | RN11: ao menos um item, todos comprados. |
| `gerar-login.ts` | RN12: `nome.sobrenome` normalizado. |
| `validar-senha.ts` | Mínimo 8 caracteres, com letra e número. |

## Fórmulas

preco_unidade_base = valor_unitario ÷ (conteudo × fator_da_unidade)
valor_item         = quantidade × valor_unitario      (arredondar para centavos)
valor_total        = soma dos valor_item dos itens comprados
ultimo_valor       = preco_unidade_base do item com comprado_em mais recente
valor_medio        = soma_precos ÷ quantidade_compras


Fatores: `L`, `kg`, `un` = 1 · `ml` = 0,001 · `g` = 0,001.

## Regras de arredondamento

- `valor_item` é inteiro em centavos: use `Math.round`.
- `preco_unidade_base` pode ter casas decimais. Não arredonde no cálculo; arredonde
  só na exibição.
- Nunca use `toFixed` para voltar a número. `toFixed` devolve string.

## Normalização do login (RN12)

1. `normalize("NFD")` para separar acentos.
2. Remover diacríticos.
3. Minúsculas.
4. Remover tudo que não for `a-z0-9`.
5. Juntar com ponto: `nome.sobrenome`.

`José` + `Álvares` → `jose.alvares`. `João` + `dos Santos` → `joao.dossantos`.

## Validação de senha

Mínimo 8 caracteres, ao menos uma letra e ao menos um número. Sem exigência de
símbolo, sem exigência de maiúscula. O esquema Zod fica em `esquemas/` e importa
esta função — a regra vive aqui, não duplicada no formulário.

## Validação

- Todo arquivo tem teste ao lado: `nome.test.ts`.
- Cubra os exemplos do documento 03, seção 5.2, e os casos de borda:
  quantidade zero, conteúdo zero, unidade incompatível com o tipo de medida.
- Teste de conversão: `500 ml` e `0,5 L` produzem o mesmo preço por litro.