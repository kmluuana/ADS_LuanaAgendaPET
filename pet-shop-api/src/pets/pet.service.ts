import { obterUsuarioPorId } from "../auth/auth.repository";
import { obterClientePorId } from "../clientes/cliente.repository";

import {
  atualizarPet,
  atualizarStatusPet,
  criarPet,
  listarPets,
  listarPetsPorCliente,
  obterPetPorId,
} from "./pet.repository";

type PerfilUsuario =
  | "CLIENTE"
  | "ATENDENTE"
  | "ADMINISTRADOR";

type DadosPet = {
  nome: string;
  especie: string;
  raca?: string;
  dataNascimento?: Date;
  observacoes?: string;
  clienteId: number;
};

type DadosPetDoUsuario = {
  nome: string;
  especie: string;
  raca?: string;
  dataNascimento?: Date;
  observacoes?: string;
  clienteId?: number;
};

function validarId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID inválido");
  }
}

async function obterClienteIdDoUsuario(usuarioId: number) {
  validarId(usuarioId);

  const usuario = await obterUsuarioPorId(usuarioId);

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  if (!usuario.ativo) {
    throw new Error("Usuário está inativo");
  }

  if (!usuario.clienteId) {
    throw new Error("Cliente não vinculado ao usuário");
  }

  return usuario.clienteId;
}

async function validarAcessoAoPet(
  usuarioId: number,
  perfil: PerfilUsuario,
  petClienteId: number,
) {
  if (perfil !== "CLIENTE") {
    return;
  }

  const clienteId = await obterClienteIdDoUsuario(usuarioId);

  if (petClienteId !== clienteId) {
    throw new Error("Pet não encontrado");
  }
}

async function validarDadosPet(dados: DadosPet) {
  if (!dados.nome || dados.nome.trim() === "") {
    throw new Error("Nome do pet é obrigatório");
  }

  if (!dados.especie || dados.especie.trim() === "") {
    throw new Error("Espécie do pet é obrigatória");
  }

  validarId(dados.clienteId);

  if (
    dados.dataNascimento &&
    Number.isNaN(dados.dataNascimento.getTime())
  ) {
    throw new Error("Data de nascimento inválida");
  }

  const cliente = await obterClientePorId(dados.clienteId);

  if (!cliente) {
    throw new Error("Cliente não encontrado");
  }

  if (!cliente.ativo) {
    throw new Error("Cliente está inativo");
  }
}

export async function buscarPets() {
  return listarPets();
}

export async function listarPetsDoUsuario(
  usuarioId: number,
  perfil: PerfilUsuario,
) {
  validarId(usuarioId);

  if (perfil !== "CLIENTE") {
    return listarPets();
  }

  const clienteId = await obterClienteIdDoUsuario(usuarioId);

  return listarPetsPorCliente(clienteId);
}

export async function buscarPetPorId(id: number) {
  validarId(id);

  const pet = await obterPetPorId(id);

  if (!pet) {
    throw new Error("Pet não encontrado");
  }

  return pet;
}

export async function buscarPetDoUsuario(
  petId: number,
  usuarioId: number,
  perfil: PerfilUsuario,
) {
  validarId(petId);
  validarId(usuarioId);

  const pet = await obterPetPorId(petId);

  if (!pet) {
    throw new Error("Pet não encontrado");
  }

  await validarAcessoAoPet(
    usuarioId,
    perfil,
    pet.clienteId,
  );

  return pet;
}

export async function cadastrarPet(dados: DadosPet) {
  await validarDadosPet(dados);

  return criarPet({
    nome: dados.nome.trim(),
    especie: dados.especie.trim(),
    raca: dados.raca?.trim(),
    dataNascimento: dados.dataNascimento,
    observacoes: dados.observacoes?.trim(),
    clienteId: dados.clienteId,
  });
}

export async function cadastrarPetDoUsuario(
  usuarioId: number,
  perfil: PerfilUsuario,
  dados: DadosPetDoUsuario,
) {
  validarId(usuarioId);

  let clienteId: number;

  if (perfil === "CLIENTE") {
    clienteId = await obterClienteIdDoUsuario(usuarioId);
  } else {
    if (!dados.clienteId) {
      throw new Error("Cliente é obrigatório");
    }

    clienteId = dados.clienteId;
  }

  return cadastrarPet({
    nome: dados.nome,
    especie: dados.especie,
    raca: dados.raca,
    dataNascimento: dados.dataNascimento,
    observacoes: dados.observacoes,
    clienteId,
  });
}

export async function editarPet(
  id: number,
  dados: DadosPet,
) {
  validarId(id);

  const pet = await obterPetPorId(id);

  if (!pet) {
    throw new Error("Pet não encontrado");
  }

  await validarDadosPet(dados);

  return atualizarPet(id, {
    nome: dados.nome.trim(),
    especie: dados.especie.trim(),
    raca: dados.raca?.trim(),
    dataNascimento: dados.dataNascimento,
    observacoes: dados.observacoes?.trim(),
    clienteId: dados.clienteId,
  });
}

export async function editarPetDoUsuario(
  petId: number,
  usuarioId: number,
  perfil: PerfilUsuario,
  dados: DadosPetDoUsuario,
) {
  validarId(petId);
  validarId(usuarioId);

  const pet = await obterPetPorId(petId);

  if (!pet) {
    throw new Error("Pet não encontrado");
  }

  await validarAcessoAoPet(
    usuarioId,
    perfil,
    pet.clienteId,
  );

  let clienteId: number;

  if (perfil === "CLIENTE") {
    clienteId = pet.clienteId;
  } else {
    if (!dados.clienteId) {
      throw new Error("Cliente é obrigatório");
    }

    clienteId = dados.clienteId;
  }

  return editarPet(petId, {
    nome: dados.nome,
    especie: dados.especie,
    raca: dados.raca,
    dataNascimento: dados.dataNascimento,
    observacoes: dados.observacoes,
    clienteId,
  });
}

export async function alterarStatusPet(
  id: number,
  ativo: boolean,
) {
  validarId(id);

  if (typeof ativo !== "boolean") {
    throw new Error("Status do pet é inválido");
  }

  const pet = await obterPetPorId(id);

  if (!pet) {
    throw new Error("Pet não encontrado");
  }

  return atualizarStatusPet(id, ativo);
}

export async function alterarStatusPetDoUsuario(
  petId: number,
  usuarioId: number,
  perfil: PerfilUsuario,
  ativo: boolean,
) {
  validarId(petId);
  validarId(usuarioId);

  const pet = await obterPetPorId(petId);

  if (!pet) {
    throw new Error("Pet não encontrado");
  }

  await validarAcessoAoPet(
    usuarioId,
    perfil,
    pet.clienteId,
  );

  return alterarStatusPet(petId, ativo);
}