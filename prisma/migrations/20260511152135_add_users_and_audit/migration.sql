/*
  Warnings:

  - You are about to drop the column `dados_anteriores` on the `auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `registro_id` on the `auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `tabela` on the `auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `criado_por` on the `dividas` table. All the data in the column will be lost.
  - You are about to drop the column `ultimo_acesso` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `entidade` to the `auditoria` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dividas" DROP CONSTRAINT "dividas_criado_por_fkey";

-- AlterTable
ALTER TABLE "auditoria" DROP COLUMN "dados_anteriores",
DROP COLUMN "registro_id",
DROP COLUMN "tabela",
ADD COLUMN     "dados_antigos" TEXT,
ADD COLUMN     "entidade" TEXT NOT NULL,
ADD COLUMN     "entidade_id" TEXT,
ALTER COLUMN "dados_novos" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "dividas" DROP COLUMN "criado_por";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "ultimo_acesso";
