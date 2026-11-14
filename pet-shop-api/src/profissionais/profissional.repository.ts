import { db } from "../prisma/db";

type CriarProfissionalInput = {
  nome: string;
  email: string;
  telefone: string;
};

type AtualizarProfissionalInput = {
  nome: string;
  email: string;
  telefone: string;
};

export async function listarProfissionais() {
  return db.profissional.findMany({
    orderBy: {
      nome: "asc",
    },
  });
}

export async function obterProfissionalPorId(
  id: number,
) {
  return db.profissional.findUnique({
    where: {
      id,
    },
  });
}

export async function obterProfissionalPorEmail(
  email: string,
) {
  return db.profissional.findUnique({
    where: {
      email,
    },
  });
}

export async function criarProfissional(
  dados: CriarProfissionalInput,
) {
  return db.profissional.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
    },
  });
}

export async function atualizarProfissional(
  id: number,
  dados: AtualizarProfissionalInput,
) {
  return db.profissional.update({
    where: {
      id,
    },
    data: {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
    },
  });
}

export async function atualizarStatusProfissional(
  id: number,
  ativo: boolean,
) {
  return db.profissional.update({
    where: {
      id,
    },
    data: {
      ativo,
    },
  });
}