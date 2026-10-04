import {
  atualizarServico,
  atualizarStatusServico,
  criarServico,
  listarServicos,
  obterServicoPorId,
} from "./servico.repository";

export async function buscarServicos() {
  return listarServicos();
}

export async function buscarServicoPorId(id: number) {
  return obterServicoPorId(id);
}

export async function cadastrarServico(dados: {
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
}) {
  validarServico(dados);

  return criarServico(dados);
}

export async function editarServico(
  id: number,
  dados: {
    nome: string;
    descricao?: string;
    preco: number;
    duracao: number;
  },
) {
  const servico = await obterServicoPorId(id);

  if (!servico) {
    return null;
  }

  validarServico(dados);

  return atualizarServico(id, dados);
}

export async function alterarStatusServico(
  id: number,
  ativo: boolean,
) {
  const servico = await obterServicoPorId(id);

  if (!servico) {
    return null;
  }

  return atualizarStatusServico(id, ativo);
}

function validarServico(dados: {
  nome: string;
  preco: number;
  duracao: number;
}) {
  if (!dados.nome || dados.nome.trim() === "") {
    throw new Error("Nome do serviço é obrigatório");
  }

  if (dados.preco <= 0) {
    throw new Error("Preço deve ser maior que zero");
  }

  if (dados.duracao <= 0) {
    throw new Error("Duração deve ser maior que zero");
  }
}