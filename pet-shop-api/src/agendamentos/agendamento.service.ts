import { obterUsuarioPorId } from "../auth/auth.repository";
import { obterPetPorId } from "../pets/pet.repository";
import { obterProfissionalPorId } from "../profissionais/profissional.repository";
import { obterRelacaoProfissionalServico } from "../profissionais/profissional-servico.repository";
import { obterServicoPorId } from "../servicos/servico.repository";

import {
  atualizarAgendamento,
  atualizarStatusAgendamento,
  criarAgendamento,
  listarAgendamentos,
  listarAgendamentosAtivosDoProfissional,
  listarAgendamentosPorCliente,
  obterAgendamentoPorId,
} from "./agendamento.repository";

type PerfilUsuario =
  | "CLIENTE"
  | "ATENDENTE"
  | "ADMINISTRADOR";

type StatusAgendamento =
  | "AGENDADO"
  | "CONCLUIDO"
  | "CANCELADO";

type DadosAgendamento = {
  dataHora: Date;
  observacoes?: string;
  petId: number;
  servicoId: number;
  profissionalId: number;
};

function validarId(
  id: number,
  nome: string,
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      `${nome} inválido`,
    );
  }
}

async function obterClienteIdDoUsuario(
  usuarioId: number,
) {
  validarId(
    usuarioId,
    "Usuário",
  );

  const usuario =
    await obterUsuarioPorId(
      usuarioId,
    );

  if (!usuario) {
    throw new Error(
      "Usuário não encontrado",
    );
  }

  if (!usuario.ativo) {
    throw new Error(
      "Usuário está inativo",
    );
  }

  if (!usuario.clienteId) {
    throw new Error(
      "Cliente não vinculado ao usuário",
    );
  }

  return usuario.clienteId;
}

async function validarPetDoUsuario(
  usuarioId: number,
  perfil: PerfilUsuario,
  petId: number,
) {
  if (perfil !== "CLIENTE") {
    return;
  }

  const clienteId =
    await obterClienteIdDoUsuario(
      usuarioId,
    );

  const pet =
    await obterPetPorId(
      petId,
    );

  if (
    !pet ||
    pet.clienteId !== clienteId
  ) {
    throw new Error(
      "Pet não encontrado",
    );
  }
}

async function validarAcessoAoAgendamento(
  usuarioId: number,
  perfil: PerfilUsuario,
  agendamentoId: number,
) {
  validarId(
    agendamentoId,
    "Agendamento",
  );

  const agendamento =
    await obterAgendamentoPorId(
      agendamentoId,
    );

  if (!agendamento) {
    throw new Error(
      "Agendamento não encontrado",
    );
  }

  if (perfil !== "CLIENTE") {
    return agendamento;
  }

  const clienteId =
    await obterClienteIdDoUsuario(
      usuarioId,
    );

  if (
    agendamento.pet.clienteId !==
    clienteId
  ) {
    throw new Error(
      "Agendamento não encontrado",
    );
  }

  return agendamento;
}

export async function buscarAgendamentos() {
  return listarAgendamentos();
}

export async function listarAgendamentosDoUsuario(
  usuarioId: number,
  perfil: PerfilUsuario,
) {
  validarId(
    usuarioId,
    "Usuário",
  );

  if (perfil !== "CLIENTE") {
    return listarAgendamentos();
  }

  const clienteId =
    await obterClienteIdDoUsuario(
      usuarioId,
    );

  return listarAgendamentosPorCliente(
    clienteId,
  );
}

export async function buscarAgendamentoPorId(
  id: number,
) {
  validarId(
    id,
    "Agendamento",
  );

  const agendamento =
    await obterAgendamentoPorId(
      id,
    );

  if (!agendamento) {
    throw new Error(
      "Agendamento não encontrado",
    );
  }

  return agendamento;
}

export async function buscarAgendamentoDoUsuario(
  agendamentoId: number,
  usuarioId: number,
  perfil: PerfilUsuario,
) {
  return validarAcessoAoAgendamento(
    usuarioId,
    perfil,
    agendamentoId,
  );
}

export async function cadastrarAgendamento(
  dados: DadosAgendamento,
) {
  validarAgendamento(dados);

  await validarRelacionamentos(
    dados,
  );

  await validarConflitoHorario(
    dados,
  );

  return criarAgendamento(
    dados,
  );
}

export async function cadastrarAgendamentoDoUsuario(
  usuarioId: number,
  perfil: PerfilUsuario,
  dados: DadosAgendamento,
) {
  validarId(
    usuarioId,
    "Usuário",
  );

  await validarPetDoUsuario(
    usuarioId,
    perfil,
    dados.petId,
  );

  return cadastrarAgendamento(
    dados,
  );
}

export async function editarAgendamento(
  id: number,
  dados: DadosAgendamento,
) {
  validarId(
    id,
    "Agendamento",
  );

  const agendamento =
    await obterAgendamentoPorId(
      id,
    );

  if (!agendamento) {
    throw new Error(
      "Agendamento não encontrado",
    );
  }

  validarAgendamento(
    dados,
  );

  await validarRelacionamentos(
    dados,
  );

  await validarConflitoHorario(
    dados,
    id,
  );

  return atualizarAgendamento(
    id,
    dados,
  );
}

export async function editarAgendamentoDoUsuario(
  agendamentoId: number,
  usuarioId: number,
  perfil: PerfilUsuario,
  dados: DadosAgendamento,
) {
  await validarAcessoAoAgendamento(
    usuarioId,
    perfil,
    agendamentoId,
  );

  await validarPetDoUsuario(
    usuarioId,
    perfil,
    dados.petId,
  );

  return editarAgendamento(
    agendamentoId,
    dados,
  );
}

export async function alterarStatusDoAgendamento(
  id: number,
  status: StatusAgendamento,
) {
  validarId(
    id,
    "Agendamento",
  );

  validarStatus(
    status,
  );

  const agendamento =
    await obterAgendamentoPorId(
      id,
    );

  if (!agendamento) {
    throw new Error(
      "Agendamento não encontrado",
    );
  }

  return atualizarStatusAgendamento(
    id,
    status,
  );
}

export async function alterarStatusDoAgendamentoDoUsuario(
  agendamentoId: number,
  usuarioId: number,
  perfil: PerfilUsuario,
  status: StatusAgendamento,
) {
  await validarAcessoAoAgendamento(
    usuarioId,
    perfil,
    agendamentoId,
  );

  validarStatus(
    status,
  );

  if (
    perfil === "CLIENTE" &&
    status !== "CANCELADO"
  ) {
    throw new Error(
      "Cliente só pode cancelar o próprio agendamento",
    );
  }

  return alterarStatusDoAgendamento(
    agendamentoId,
    status,
  );
}

async function validarRelacionamentos(
  dados: {
    petId: number;
    servicoId: number;
    profissionalId: number;
  },
) {
  const pet =
    await obterPetPorId(
      dados.petId,
    );

  if (!pet) {
    throw new Error(
      "Pet não encontrado",
    );
  }

  if (!pet.ativo) {
    throw new Error(
      "Pet está inativo",
    );
  }

  const servico =
    await obterServicoPorId(
      dados.servicoId,
    );

  if (!servico) {
    throw new Error(
      "Serviço não encontrado",
    );
  }

  if (!servico.ativo) {
    throw new Error(
      "Serviço está inativo",
    );
  }

  const profissional =
    await obterProfissionalPorId(
      dados.profissionalId,
    );

  if (!profissional) {
    throw new Error(
      "Profissional não encontrado",
    );
  }

  if (!profissional.ativo) {
    throw new Error(
      "Profissional está inativo",
    );
  }

  const vinculo =
    await obterRelacaoProfissionalServico(
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
  const servico =
    await obterServicoPorId(
      dados.servicoId,
    );

  if (!servico) {
    throw new Error(
      "Serviço não encontrado",
    );
  }

  const inicioNovo =
    dados.dataHora;

  const fimNovo =
    new Date(
      inicioNovo.getTime() +
        servico.duracao *
          60 *
          1000,
    );

  const agendamentos =
    await listarAgendamentosAtivosDoProfissional(
      dados.profissionalId,
    );

  for (
    const agendamento
    of agendamentos
  ) {
    if (
      agendamentoIdIgnorado &&
      agendamento.id ===
        agendamentoIdIgnorado
    ) {
      continue;
    }

    const inicioExistente =
      agendamento.dataHora;

    const fimExistente =
      new Date(
        inicioExistente.getTime() +
          agendamento.servico
            .duracao *
            60 *
            1000,
      );

    const existeConflito =
      inicioNovo <
        fimExistente &&
      fimNovo >
        inicioExistente;

    if (existeConflito) {
      throw new Error(
        "Profissional já possui um agendamento neste período",
      );
    }
  }
}

function validarAgendamento(
  dados: DadosAgendamento,
) {
  validarDataAgendamento(
    dados.dataHora,
  );

  validarId(
    dados.petId,
    "Pet",
  );

  validarId(
    dados.servicoId,
    "Serviço",
  );

  validarId(
    dados.profissionalId,
    "Profissional",
  );
}

function validarDataAgendamento(
  dataHora: Date,
) {
  if (
    !(dataHora instanceof Date) ||
    Number.isNaN(
      dataHora.getTime(),
    )
  ) {
    throw new Error(
      "Data e hora inválidas",
    );
  }

  const agora =
    new Date();

  if (
    dataHora.getTime() <=
    agora.getTime()
  ) {
    throw new Error(
      "Não é possível agendar para uma data ou horário no passado",
    );
  }

  const limiteMaximo =
    new Date(agora);

  limiteMaximo.setFullYear(
    limiteMaximo.getFullYear() +
      1,
  );

  if (
    dataHora.getTime() >
    limiteMaximo.getTime()
  ) {
    throw new Error(
      "O agendamento pode ser realizado com no máximo 1 ano de antecedência",
    );
  }
}

function validarStatus(
  status: StatusAgendamento,
) {
  const statusValidos:
    StatusAgendamento[] = [
      "AGENDADO",
      "CONCLUIDO",
      "CANCELADO",
    ];

  if (
    !statusValidos.includes(
      status,
    )
  ) {
    throw new Error(
      "Status de agendamento inválido",
    );
  }
}