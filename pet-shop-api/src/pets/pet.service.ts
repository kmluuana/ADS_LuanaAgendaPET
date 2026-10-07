import {
  atualizarPet,
  atualizarStatusPet,
  criarPet,
  listarPets,
  obterPetPorId,
} from "./pet.repository";

import { obterClientePorId } from "../clientes/cliente.repository";

export async function buscarPets() {
  return listarPets();
}

export async function buscarPetPorId(id: number) {
  return obterPetPorId(id);
}

export async function cadastrarPet(dados: {
  nome: string;
  especie: string;
  raca?: string;
  dataNascimento?: Date;
  observacoes?: string;
  clienteId: number;
}) {
  validarPet(dados);

  const cliente = await obterClientePorId(dados.clienteId);

  if (!cliente) {
    throw new Error("Cliente não encontrado");
  }

  return criarPet(dados);
}

export async function editarPet(
  id: number,
  dados: {
    nome: string;
    especie: string;
    raca?: string;
    dataNascimento?: Date;
    observacoes?: string;
    clienteId: number;
  },
) {
  const pet = await obterPetPorId(id);

  if (!pet) {
    return null;
  }

  validarPet(dados);

  const cliente = await obterClientePorId(dados.clienteId);

  if (!cliente) {
    throw new Error("Cliente não encontrado");
  }

  return atualizarPet(id, dados);
}

export async function alterarStatusPet(
  id: number,
  ativo: boolean,
) {
  const pet = await obterPetPorId(id);

  if (!pet) {
    return null;
  }

  return atualizarStatusPet(id, ativo);
}

function validarPet(dados: {
  nome: string;
  especie: string;
  clienteId: number;
}) {
  if (!dados.nome || dados.nome.trim() === "") {
    throw new Error("Nome é obrigatório");
  }

  if (!dados.especie || dados.especie.trim() === "") {
    throw new Error("Espécie é obrigatória");
  }

  if (!Number.isInteger(dados.clienteId) || dados.clienteId <= 0) {
    throw new Error("Cliente inválido");
  }
}