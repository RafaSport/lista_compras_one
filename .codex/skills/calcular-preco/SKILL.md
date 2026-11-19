---
name: calcular-preco
description: Implementa ou revisa um cálculo de preço no domínio, com teste.
---

# Calcular preço

## Quando usar

Quando o requisito envolve preço por unidade base, valor de item, total, último
valor, média ou comparação entre supermercados.

## Pré-requisitos

1. A fórmula está em `docs/03-modelo-de-dados.md`, seção 5.
2. Você sabe a unidade de entrada e a unidade base de saída.
3. Você sabe se o resultado é dinheiro (inteiro em centavos) ou preço por unidade
   (pode ter casas decimais).

## Procedimento

1. Escreva a função em `src/dominio/`, pura, sem `async`.
2. Receba a data como parâmetro quando precisar de "mais recente". Não chame
   `Date.now()` dentro da função.
3. Dinheiro: inteiro em centavos, arredondado com `Math.round`.
4. Preço por unidade base: não arredonde no cálculo.
5. Escreva o teste ao lado, com os exemplos do documento 03, seção 5.2.
6. Cubra borda: quantidade zero, conteúdo zero, unidade incompatível.

## Conversão

| Unidade         | Fator |
| --------------- | ----- |
| `L`, `kg`, `un` | 1     |
| `ml`            | 0,001 |
| `g`             | 0,001 |

## Casos de teste obrigatórios

- Galão 5 L por R$ 9,00 resulta em 180 centavos por litro.
- Frasco 2 L por R$ 4,00 resulta em 200 centavos por litro.
- Frasco 500 ml por R$ 3,00 resulta em 600 centavos por litro.
- 500 ml e 0,5 L produzem o mesmo resultado.
- Comparação: 5 L por R$ 9 é mais barato que 2 L por R$ 4.

## Critério de aceitação

- [ ] Função pura, sem import de React, Dexie, Prisma ou rede.
- [ ] Teste cobre os cinco casos acima.
- [ ] Dinheiro é inteiro em centavos.
- [ ] `npm test` passa.
