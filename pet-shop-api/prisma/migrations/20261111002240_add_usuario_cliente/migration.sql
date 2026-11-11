/*
  Warnings:

  - A unique constraint covering the columns `[clienteId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "clienteId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_clienteId_key" ON "Usuario"("clienteId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
