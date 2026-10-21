import { db } from "../prisma/db";

export async function adicionarServicoAoProfissional(
  profissionalId: number,
  servicoId: number,
) {
  return db.profissionalServico.create({
    data: {
      profissionalId,
      servicoId,
    },
  });
}

export async function listarServicosDoProfissional(
  profissionalId: number,
) {
  return db.profissionalServico.findMany({
    where: {
      profissionalId,
    },
    include: {
      servico: true,
    },
  });
}

export async function removerServicoDoProfissional(
  profissionalId: number,
  servicoId: number,
) {
  return db.profissionalServico.delete({
    where: {
      profissionalId_servicoId: {
        profissionalId,
        servicoId,
      },
    },
  });
}

export async function obterRelacaoProfissionalServico(
  profissionalId: number,
  servicoId: number,
) {
  return db.profissionalServico.findUnique({
    where: {
      profissionalId_servicoId: {
        profissionalId,
        servicoId,
      },
    },
  });
}