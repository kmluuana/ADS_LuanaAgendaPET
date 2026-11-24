import { db } from "../prisma/db";

type CriarServicoInput = {
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
};

type AtualizarServicoInput = {
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
};

export async function listarServicos() {
  return db.servico.findMany({
    orderBy: {
      nome: "asc",
    },
  });
}

export async function obterServicoPorId(
  id: number,
) {
  return db.servico.findUnique({
    where: {
      id,
    },
  });
}

export async function criarServico(
  dados: CriarServicoInput,
) {
  return db.servico.create({
    data: {
      nome: dados.nome,
      descricao:
        dados.descricao,
      preco: dados.preco,
      duracao:
        dados.duracao,
    },
  });
}

export async function atualizarServico(
  id: number,
  dados: AtualizarServicoInput,
) {
  return db.servico.update({
    where: {
      id,
    },
    data: {
      nome: dados.nome,
      descricao:
        dados.descricao,
      preco: dados.preco,
      duracao:
        dados.duracao,
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