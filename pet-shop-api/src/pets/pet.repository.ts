import { db } from "../prisma/db";

export async function listarPets() {
  return db.pet.findMany();
}

export async function obterPetPorId(id: number) {
  return db.pet.findUnique({
    where: {
      id,
    },
  });
}

export async function criarPet(dados: {
  nome: string;
  especie: string;
  raca?: string;
  dataNascimento?: Date;
  observacoes?: string;
  clienteId: number;
}) {
  return db.pet.create({
    data: {
      nome: dados.nome,
      especie: dados.especie,
      raca: dados.raca,
      dataNascimento: dados.dataNascimento,
      observacoes: dados.observacoes,
      clienteId: dados.clienteId,
    },
  });
}

export async function atualizarPet(
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
  return db.pet.update({
    where: {
      id,
    },
    data: {
      nome: dados.nome,
      especie: dados.especie,
      raca: dados.raca,
      dataNascimento: dados.dataNascimento,
      observacoes: dados.observacoes,
      clienteId: dados.clienteId,
    },
  });
}

export async function atualizarStatusPet(id: number, ativo: boolean) {
  return db.pet.update({
    where: {
      id,
    },
    data: {
      ativo,
    },
  });
}