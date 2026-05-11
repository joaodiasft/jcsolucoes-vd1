-- CreateTable
CREATE TABLE "devedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dividas" (
    "id" TEXT NOT NULL,
    "devedor_id" TEXT NOT NULL,
    "valor_original" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT,
    "data_vencimento" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dividas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_acesso" (
    "id" TEXT NOT NULL,
    "devedor_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "divida_id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_pagamento" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_acesso_token_hash_key" ON "tokens_acesso"("token_hash");

-- AddForeignKey
ALTER TABLE "dividas" ADD CONSTRAINT "dividas_devedor_id_fkey" FOREIGN KEY ("devedor_id") REFERENCES "devedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_acesso" ADD CONSTRAINT "tokens_acesso_devedor_id_fkey" FOREIGN KEY ("devedor_id") REFERENCES "devedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_divida_id_fkey" FOREIGN KEY ("divida_id") REFERENCES "dividas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
