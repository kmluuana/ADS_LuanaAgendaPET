import { db } from "../prisma/db";

export async function listarAgendamentos() {
  return db.agendamento.findMany({
    include: {
      pet: true,
      servico: true,
      profissional: true,
    },
    orderBy: {
      dataHora: "asc",
    },
  });
}

export async function listarAgendamentosPorCliente(
  clienteId: number,
) {
  return db.agendamento.findMany({
    where: {
      pet: {
        clienteId,
      },
    },
    include: {
      pet: true,
      servico: true,
      profissional: true,
    },
    orderBy: {
      dataHora: "asc",
    },
  });
}

export async function obterAgendamentoPorId(
  id: number,
) {
  return db.agendamento.findUnique({
    where: {
      id,
    },
    include: {
      pet: true,
      servico: true,
      profissional: true,
    },
  });
}

export async function criarAgendamento(
  dados: {
    dataHora: Date;
    observacoes?: string;
    petId: number;
    servicoId: number;
    profissionalId: number;
  },
) {
  return db.agendamento.create({
    data: {
      dataHora: dados.dataHora,
      observacoes: dados.observacoes,
      petId: dados.petId,
      servicoId: dados.servicoId,
      profissionalId: dados.profissionalId,
    },
  });
}

export async function atualizarAgendamento(
  id: number,
  dados: {
    dataHora: Date;
    observacoes?: string;
    petId: number;
    servicoId: number;
    profissionalId: number;
  },
) {
  return db.agendamento.update({
    where: {
      id,
    },
    data: {
      dataHora: dados.dataHora,
      observacoes: dados.observacoes,
      petId: dados.petId,
      servicoId: dados.servicoId,
      profissionalId: dados.profissionalId,

      // Se o agendamento foi alterado,
      // o lembrete precisa poder ser enviado novamente.
      lembrete24hEnviadoEm: null,
      lembrete24hProcessandoEm: null,
      lembrete24hUltimoErro: null,
    },
  });
}

export async function atualizarStatusAgendamento(
  id: number,
  status:
    | "AGENDADO"
    | "CONCLUIDO"
    | "CANCELADO",
) {
  return db.agendamento.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function listarAgendamentosAtivosDoProfissional(
  profissionalId: number,
) {
  return db.agendamento.findMany({
    where: {
      profissionalId,
      status: "AGENDADO",
    },
    include: {
      servico: true,
    },
    orderBy: {
      dataHora: "asc",
    },
  });
}

export async function listarLembretes24hPendentes(
  inicio: Date,
  fim: Date,
) {
  return db.agendamento.findMany({
    where: {
      status: "AGENDADO",

      lembrete24hEnviadoEm: null,
      lembrete24hProcessandoEm: null,

      dataHora: {
        gte: inicio,
        lt: fim,
      },
    },

    include: {
      pet: {
        include: {
          cliente: true,
        },
      },

      servico: true,
      profissional: true,
    },

    orderBy: {
      dataHora: "asc",
    },
  });
}

export async function reservarLembrete24h(
  agendamentoId: number,
) {
  const processandoEm =
    new Date();

  const resultado =
    await db.agendamento.updateMany({
      where: {
        id: agendamentoId,

        status: "AGENDADO",

        lembrete24hEnviadoEm:
          null,

        lembrete24hProcessandoEm:
          null,
      },

      data: {
        lembrete24hProcessandoEm:
          processandoEm,

        lembrete24hUltimoErro:
          null,
      },
    });

  if (resultado.count !== 1) {
    return null;
  }

  return processandoEm;
}

export async function concluirLembrete24hReservado(
  agendamentoId: number,
  processandoEm: Date,
) {
  const resultado =
    await db.agendamento.updateMany({
      where: {
        id: agendamentoId,

        lembrete24hEnviadoEm:
          null,

        lembrete24hProcessandoEm:
          processandoEm,
      },

      data: {
        lembrete24hEnviadoEm:
          new Date(),

        lembrete24hProcessandoEm:
          null,

        lembrete24hUltimoErro:
          null,
      },
    });

  return resultado.count === 1;
}

export async function marcarLembrete24hEnviado(
  agendamentoId: number,
) {
  return db.agendamento.update({
    where: {
      id: agendamentoId,
    },

    data: {
      lembrete24hEnviadoEm:
        new Date(),

      lembrete24hProcessandoEm:
        null,

      lembrete24hUltimoErro:
        null,
    },
  });
}

export async function registrarErroLembrete24h(
  agendamentoId: number,
  erro: string,
) {
  return db.agendamento.update({
    where: {
      id: agendamentoId,
    },

    data: {
      lembrete24hProcessandoEm:
        null,

      lembrete24hUltimoErro:
        erro,
    },
  });
}