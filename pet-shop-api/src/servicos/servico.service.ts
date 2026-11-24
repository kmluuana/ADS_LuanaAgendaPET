import {
  atualizarServico,
  atualizarStatusServico,
  criarServico,
  listarServicos,
  obterServicoPorId,
} from "./servico.repository";

type ServicoInput = {
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
};

function validarId(
  id: number,
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "ID do serviço inválido",
    );
  }
}

function normalizarDados(
  dados: ServicoInput,
) {
  const nome =
    dados.nome?.trim();

  const descricao =
    dados.descricao?.trim() ||
    null;

  const preco =
    Number(dados.preco);

  const duracao =
    Number(dados.duracao);

  if (
    !nome ||
    nome.length < 3
  ) {
    throw new Error(
      "O nome do serviço deve possuir pelo menos 3 caracteres",
    );
  }

  if (
    !Number.isFinite(preco) ||
    preco <= 0
  ) {
    throw new Error(
      "Informe um preço válido",
    );
  }

  if (
    !Number.isInteger(
      duracao,
    ) ||
    duracao <= 0
  ) {
    throw new Error(
      "Informe uma duração válida em minutos",
    );
  }

  return {
    nome,
    descricao,
    preco,
    duracao,
  };
}

export async function buscarServicos() {
  return listarServicos();
}

export async function buscarServicoPorId(
  id: number,
) {
  validarId(id);

  const servico =
    await obterServicoPorId(
      id,
    );

  if (!servico) {
    throw new Error(
      "Serviço não encontrado",
    );
  }

  return servico;
}

export async function cadastrarServico(
  dados: ServicoInput,
) {
  const dadosNormalizados =
    normalizarDados(
      dados,
    );

  return criarServico(
    dadosNormalizados,
  );
}

export async function editarServico(
  id: number,
  dados: ServicoInput,
) {
  validarId(id);

  await buscarServicoPorId(
    id,
  );

  const dadosNormalizados =
    normalizarDados(
      dados,
    );

  return atualizarServico(
    id,
    dadosNormalizados,
  );
}

export async function alterarStatusServico(
  id: number,
  ativo: boolean,
) {
  validarId(id);

  if (
    typeof ativo !==
    "boolean"
  ) {
    throw new Error(
      "Status do serviço inválido",
    );
  }

  await buscarServicoPorId(
    id,
  );

  return atualizarStatusServico(
    id,
    ativo,
  );
}