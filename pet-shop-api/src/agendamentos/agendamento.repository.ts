
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
  status: "AGENDADO" | "CONCLUIDO" | "CANCELADO",
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
 * Consulta agendamentos elegíveis para lembrete.
 *
 * Apenas agendamentos não enviados e
 * não reservados são retornados.
 */
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

/**
 * Tenta reservar atomicamente um agendamento.
 *
 * Retorna a data da reserva quando consegue
 * reservar e null caso contrário.
 */
export async function reservarLembrete24h(
  agendamentoId: number,
): Promise<Date | null> {
  const reservadoEm = new Date();

  const resultado = await db.agendamento.updateMany({
    where: {
      id: agendamentoId,
      status: "AGENDADO",
      lembrete24hEnviadoEm: null,
      lembrete24hProcessandoEm: null,
    },
    data: {
      lembrete24hProcessandoEm: reservadoEm,
    },
  });

  return resultado.count === 1 ? reservadoEm : null;
}

/**
 * Conclui um lembrete reservado.
 *
 * A data da reserva identifica qual execução
 * possui o direito de finalizar o processamento.
 */
export async function concluirLembrete24hReservado(
  agendamentoId: number,
  reservadoEm: Date,
) {
  const resultado = await db.agendamento.updateMany({
    where: {
      id: agendamentoId,
      lembrete24hProcessandoEm: reservadoEm,
      lembrete24hEnviadoEm: null,
    },
    data: {
      lembrete24hEnviadoEm: new Date(),
      lembrete24hUltimoErro: null,
      lembrete24hProcessandoEm: null,
    },
  });

  return resultado.count === 1;
}

/**
 * Registra erro e libera a reserva,
 * desde que ela pertença à mesma execução.
 */
export async function registrarErroLembrete24hReservado(
  agendamentoId: number,
  reservadoEm: Date,
  erro: string,
) {
  const resultado = await db.agendamento.updateMany({
    where: {
      id: agendamentoId,
      lembrete24hProcessandoEm: reservadoEm,
      lembrete24hEnviadoEm: null,
    },
    data: {
      lembrete24hUltimoErro: erro,
      lembrete24hProcessandoEm: null,
    },
  });

  return resultado.count === 1;
}

/**
 * Métodos originais mantidos temporariamente
 * para preservar a compatibilidade com o service.
 *
 * Serão substituídos no próximo passo.
 */
export async function marcarLembrete24hEnviado(
  agendamentoId: number,
) {
  return db.agendamento.update({
    where: {
      id: agendamentoId,
    },
    data: {
      lembrete24hEnviadoEm: new Date(),
      lembrete24hUltimoErro: null,
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
      lembrete24hUltimoErro: erro,
    },
  });
}
