-- CreateTable
CREATE TABLE "ProfissionalServico" (
    "profissionalId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,

    CONSTRAINT "ProfissionalServico_pkey" PRIMARY KEY ("profissionalId","servicoId")
);

-- AddForeignKey
ALTER TABLE "ProfissionalServico" ADD CONSTRAINT "ProfissionalServico_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfissionalServico" ADD CONSTRAINT "ProfissionalServico_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
