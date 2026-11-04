-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('CLIENTE', 'ATENDENTE', 'ADMINISTRADOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "googleId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'CLIENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_googleId_key" ON "Usuario"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
