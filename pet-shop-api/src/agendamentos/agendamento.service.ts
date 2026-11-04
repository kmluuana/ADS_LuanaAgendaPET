import {
  atualizarAgendamento,
  atualizarStatusAgendamento,
  criarAgendamento,
  listarAgendamentos,
  listarAgendamentosAtivosDoProfissional,
  obterAgendamentoPorId,
} from "./agendamento.repository";

import { obterPetPorId } from "../pets/pet.repository";
import { obterProfissionalPorId } from "../profissionais/profissional.repository";
import { obterServicoPorId } from "../servicos/servico.repository";
import { obterRelacaoProfissionalServico } from "../profissionais/profissional-servico.repository";

export async function buscarAgendamentos() {
  return listarAgendamentos();
}

export async function buscarAgendamentoPorId(id: number) {
  return obterAgendamentoPorId(id);
}

export async function cadastrarAgendamento(dados: {
  dataHora: Date;
  observacoes?: string;
  petId: number;
  servicoId: number;
  profissionalId: number;
}) {
  validarAgendamento(dados);

  await validarRelacionamentos(dados);

  await validarConflitoHorario(dados);

  return criarAgendamento(dados);
}

export async function editarAgendamento(
  id: number,
  dados: {
    dataHora: Date;
    observacoes?: string;
    petId: number;
    servicoId: number;
    profissionalId: number;
  },
) {
  const agendamento = await obterAgendamentoPorId(id);

  if (!agendamento) {
    return null;
  }

  validarAgendamento(dados);

  await validarRelacionamentos(dados);

  await validarConflitoHorario(dados, id);

  return atualizarAgendamento(id, dados);
}

export async function alterarStatusDoAgendamento(
  id: number,
  status: "AGENDADO" | "CONCLUIDO" | "CANCELADO",
) {
  const agendamento = await obterAgendamentoPorId(id);

  if (!agendamento) {
    return null;
  }

  return atualizarStatusAgendamento(id, status);
}

async function validarRelacionamentos(dados: {
  petId: number;
  servicoId: number;
  profissionalId: number;
}) {
  const pet = await obterPetPorId(dados.petId);

  if (!pet) {
    throw new Error("Pet não encontrado");
  }

  if (!pet.ativo) {
    throw new Error("Pet está inativo");
  }

  const servico = await obterServicoPorId(dados.servicoId);

  if (!servico) {
    throw new Error("Serviço não encontrado");
  }

  if (!servico.ativo) {
    throw new Error("Serviço está inativo");
  }

  const profissional = await obterProfissionalPorId(
    dados.profissionalId,
  );

  if (!profissional) {
    throw new Error("Profissional não encontrado");
  }

  if (!profissional.ativo) {
    throw new Error("Profissional está inativo");
  }

  const vinculo = await obterRelacaoProfissionalServico(
    dados.profissionalId,
    dados.servicoId,
  );

  if (!vinculo) {
    throw new Error(
      "Profissional não realiza o serviço selecionado",
    );
  }
}

async function validarConflitoHorario(
  dados: {
    dataHora: Date;
    servicoId: number;
    profissionalId: number;
  },
  agendamentoIdIgnorado?: number,
) {
  const servico = await obterServicoPorId(dados.servicoId);

  if (!servico) {
    throw new Error("Serviço não encontrado");
  }

  const inicioNovo = dados.dataHora;

  const fimNovo = new Date(
    inicioNovo.getTime() + servico.duracao * 60 * 1000,
  );

  const agendamentos =
    await listarAgendamentosAtivosDoProfissional(
      dados.profissionalId,
    );

  for (const agendamento of agendamentos) {
    if (
      agendamentoIdIgnorado &&
      agendamento.id === agendamentoIdIgnorado
    ) {
      continue;
    }

    const inicioExistente = agendamento.dataHora;

    const fimExistente = new Date(
      inicioExistente.getTime() +
        agendamento.servico.duracao * 60 * 1000,
    );

    const existeConflito =
      inicioNovo < fimExistente &&
      fimNovo > inicioExistente;

    if (existeConflito) {
      throw new Error(
        "Profissional já possui um agendamento neste período",
      );
    }
  }
}

function validarAgendamento(dados: {
  dataHora: Date;
  petId: number;
  servicoId: number;
  profissionalId: number;
}) {
  if (
    !(dados.dataHora instanceof Date) ||
    Number.isNaN(dados.dataHora.getTime())
  ) {
    throw new Error("Data e hora inválidas");
  }

  if (!Number.isInteger(dados.petId) || dados.petId <= 0) {
    throw new Error("Pet inválido");
  }

  if (
    !Number.isInteger(dados.servicoId) ||
    dados.servicoId <= 0
  ) {
    throw new Error("Serviço inválido");
  }

  if (
    !Number.isInteger(dados.profissionalId) ||
    dados.profissionalId <= 0
  ) {
    throw new Error("Profissional inválido");
  }
}