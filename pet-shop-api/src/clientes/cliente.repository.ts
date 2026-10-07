import { db } from "../prisma/db";

export async function listarClientes() {
  return db.cliente.findMany();
}

export async function obterClientePorId(id: number) {
  return db.cliente.findUnique({
    where: {
      id,
    },
  });
}

export async function obterClientePorEmail(email: string) {
  return db.cliente.findUnique({
    where: {
      email,
    },
  });
}

export async function criarCliente(dados: {
  nome: string;
  email: string;
  telefone: string;
}) {
  return db.cliente.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
    },
  });
}

export async function atualizarCliente(
  id: number,
  dados: {
    nome: string;
    email: string;
    telefone: string;
  },
) {
  return db.cliente.update({
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

export async function atualizarStatusCliente(
  id: number,
  ativo: boolean,
) {
  return db.cliente.update({
    where: {
      id,
    },
    data: {
      ativo,
    },
  });
}