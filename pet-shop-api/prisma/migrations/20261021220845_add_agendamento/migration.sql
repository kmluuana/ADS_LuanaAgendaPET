-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" SERIAL NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" "StatusAgendamento" NOT NULL DEFAULT 'AGENDADO',
    "observacoes" TEXT,
    "petId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,
    "profissionalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
