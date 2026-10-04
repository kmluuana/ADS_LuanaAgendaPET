import { db } from "../prisma/db";

export async function listarServicos() {
  return db.servico.findMany();
}

export async function obterServicoPorId(id: number) {
  return db.servico.findUnique({
    where: {
      id,
    },
  });
}

export async function criarServico(dados: {
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
}) {
  return db.servico.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      preco: dados.preco,
      duracao: dados.duracao,
    },
  });
}

export async function atualizarServico(
  id: number,
  dados: {
    nome: string;
    descricao?: string;
    preco: number;
    duracao: number;
  },
) {
  return db.servico.update({
    where: {
      id,
    },
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      preco: dados.preco,
      duracao: dados.duracao,
    },
  });
}

export async function atualizarStatusServico(
  id: number,
  ativo: boolean,
) {
  return db.servico.update({
    where: {
      id,
    },
    data: {
      ativo,
    },
  });
}