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

/**
 * Busca os agendamentos que devem
 * receber o lembrete de 24 horas.
 *
 * A janela de horário é recebida
 * pelo service.
 */
export async function listarLembretes24hPendentes(
  inicio: Date,
  fim: Date,
) {
  return db.agendamento.findMany({
    where: {
      status: "AGENDADO",

      lembrete24hEnviadoEm: null,

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

/**
 * Marca o lembrete como enviado.
 */
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

      lembrete24hUltimoErro:
        null,
    },
  });
}

/**
 * Guarda o último erro ocorrido
 * ao tentar enviar o lembrete.
 */
export async function registrarErroLembrete24h(
  agendamentoId: number,
  erro: string,
) {
  return db.agendamento.update({
    where: {
      id: agendamentoId,
    },

    data: {
      lembrete24hUltimoErro:
        erro,
    },
  });
}