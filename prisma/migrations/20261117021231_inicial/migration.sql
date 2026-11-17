-- CreateEnum
CREATE TYPE "TipoMedida" AS ENUM ('volume', 'peso', 'unidade');

-- CreateEnum
CREATE TYPE "Unidade" AS ENUM ('L', 'ml', 'kg', 'g', 'un');

-- CreateEnum
CREATE TYPE "UnidadeBase" AS ENUM ('L', 'kg', 'un');

-- CreateEnum
CREATE TYPE "SituacaoCompra" AS ENUM ('em_montagem', 'em_aberto', 'finalizada');

-- CreateEnum
CREATE TYPE "SituacaoItem" AS ENUM ('pendente', 'comprado');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supermercados" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supermercados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_lista" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_lista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo_medida" "TipoMedida" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_lista" (
    "id" UUID NOT NULL,
    "tipo_lista_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade_padrao" DECIMAL(12,3) NOT NULL,
    "unidade_padrao" "Unidade" NOT NULL,
    "marca" TEXT,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_lista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "supermercado_id" UUID NOT NULL,
    "tipo_lista_id" UUID NOT NULL,
    "situacao" "SituacaoCompra" NOT NULL,
    "valor_total" INTEGER,
    "criada_em" TIMESTAMP(3) NOT NULL,
    "fechada_em" TIMESTAMP(3),
    "finalizada_em" TIMESTAMP(3),
    "salva_em" TIMESTAMP(3),
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_compra" (
    "id" UUID NOT NULL,
    "compra_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "situacao" "SituacaoItem" NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,
    "embalagem" TEXT,
    "conteudo" DECIMAL(12,3) NOT NULL,
    "unidade" "Unidade" NOT NULL,
    "marca" TEXT,
    "observacao" TEXT,
    "valor_unitario" INTEGER,
    "valor_item" INTEGER,
    "unidade_base" "UnidadeBase",
    "preco_unidade_base" DECIMAL(12,4),
    "comprado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_compra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_login_key" ON "usuarios"("login");

-- CreateIndex
CREATE INDEX "supermercados_usuario_id_idx" ON "supermercados"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "supermercados_usuario_id_nome_key" ON "supermercados"("usuario_id", "nome");

-- CreateIndex
CREATE INDEX "tipos_lista_usuario_id_idx" ON "tipos_lista"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_lista_usuario_id_nome_key" ON "tipos_lista"("usuario_id", "nome");

-- CreateIndex
CREATE INDEX "produtos_usuario_id_idx" ON "produtos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_usuario_id_nome_key" ON "produtos"("usuario_id", "nome");

-- CreateIndex
CREATE INDEX "itens_lista_produto_id_idx" ON "itens_lista"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "itens_lista_tipo_lista_id_produto_id_key" ON "itens_lista"("tipo_lista_id", "produto_id");

-- CreateIndex
CREATE INDEX "compras_usuario_id_situacao_idx" ON "compras"("usuario_id", "situacao");

-- CreateIndex
CREATE INDEX "compras_usuario_id_supermercado_id_tipo_lista_id_idx" ON "compras"("usuario_id", "supermercado_id", "tipo_lista_id");

-- CreateIndex
CREATE INDEX "compras_usuario_id_salva_em_idx" ON "compras"("usuario_id", "salva_em");

-- CreateIndex
CREATE INDEX "itens_compra_produto_id_comprado_em_idx" ON "itens_compra"("produto_id", "comprado_em");

-- CreateIndex
CREATE UNIQUE INDEX "itens_compra_compra_id_produto_id_key" ON "itens_compra"("compra_id", "produto_id");

-- AddForeignKey
ALTER TABLE "supermercados" ADD CONSTRAINT "supermercados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_lista" ADD CONSTRAINT "tipos_lista_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_lista" ADD CONSTRAINT "itens_lista_tipo_lista_id_fkey" FOREIGN KEY ("tipo_lista_id") REFERENCES "tipos_lista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_lista" ADD CONSTRAINT "itens_lista_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_supermercado_id_fkey" FOREIGN KEY ("supermercado_id") REFERENCES "supermercados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_tipo_lista_id_fkey" FOREIGN KEY ("tipo_lista_id") REFERENCES "tipos_lista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_compra" ADD CONSTRAINT "itens_compra_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "compras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_compra" ADD CONSTRAINT "itens_compra_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
