# Sincronização

## Responsabilidade

`src/sincronizacao/` é o lado do aparelho: fila de compras pendentes, envio e
download em aparelho novo. `src/app/api/` é o lado do servidor.

## Limites

- `sincronizacao` pode importar de: `banco-local`, `esquemas`, `tipos`.
- Não importa de `componentes` nem de `ganchos`.
- `servidor` é exclusivo do servidor, com `import "server-only"`.

## Envio de compra

1. Compra `finalizada` e `salva_em` vazio.
2. `POST /api/compras` com a compra, os itens comprados e os cadastros usados.
3. Servidor valida com Zod, confere o usuário e grava tudo em uma transação,
   com upsert por `id`.
4. Sucesso: o aparelho preenche `salva_em`.

Repetir o envio não duplica. O `id` é UUID gerado no aparelho (RN08).

## Fila

- Compras finalizadas sem `salva_em` aparecem em `/pendentes` e no Início.
- Tentativa automática ao abrir com internet e quando a conexão volta.
- Botão manual sempre disponível.
- Não dependa de Background Sync do navegador: não existe em todos os aparelhos.

## Endpoints

| Endpoint                   | Função                                                         |
| -------------------------- | -------------------------------------------------------------- |
| `POST /api/compras`        | Recebe compra finalizada. Idempotente.                         |
| `/api/auth/*`              | Auth.js: login, logout, sessão.                                |
| `POST /api/cadastro`       | Cria usuário. Exige código de convite. Recusa login duplicado. |
| `GET /api/sincronizacao`   | Cadastros e histórico do usuário.                              |
| `DELETE /api/compras/[id]` | Exclui compra salva.                                           |

## Aparelho novo

Login com internet, depois `GET /api/sincronizacao`, grava no Dexie e reconstrói
`resumo_precos` a partir dos itens comprados.

Limitação aceita: compras `em_montagem` e `em_aberto` existem só no aparelho onde
foram criadas. Não tente sincronizá-las.

## Conflitos

- Compras não conflitam: nascem em um aparelho e não mudam depois de finalizadas.
- Cadastro editado em dois aparelhos: vence o `atualizado_em` mais recente.

## Validação

- Teste: enviar a mesma compra duas vezes cria um registro só.
- Teste: `POST /api/compras` sem sessão devolve 401.
- Teste: `POST /api/compras` com payload inválido devolve 400 e não grava nada.
- Teste: reconstruir `resumo_precos` a partir de `itens_compra` produz o mesmo
  resultado do cache original.
