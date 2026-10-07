import {
  atualizarCliente,
  atualizarStatusCliente,
  criarCliente,
  listarClientes,
  obterClientePorEmail,
  obterClientePorId,
} from "./cliente.repository";

export async function buscarClientes() {
  return listarClientes();
}

export async function buscarClientePorId(id: number) {
  return obterClientePorId(id);
}

export async function cadastrarCliente(dados: {
  nome: string;
  email: string;
  telefone: string;
}) {
  validarCliente(dados);

  const clienteExistente = await obterClientePorEmail(dados.email);

  if (clienteExistente) {
    return null;
  }

  return criarCliente(dados);
}

export async function editarCliente(
  id: number,
  dados: {
    nome: string;
    email: string;
    telefone: string;
  },
) {
  const cliente = await obterClientePorId(id);

  if (!cliente) {
    return null;
  }

  validarCliente(dados);

  const clienteComEmail = await obterClientePorEmail(dados.email);

  if (clienteComEmail && clienteComEmail.id !== id) {
    throw new Error("Já existe outro cliente com este e-mail");
  }

  return atualizarCliente(id, dados);
}

export async function alterarStatusCliente(
  id: number,
  ativo: boolean,
) {
  const cliente = await obterClientePorId(id);

  if (!cliente) {
    return null;
  }

  return atualizarStatusCliente(id, ativo);
}

function validarCliente(dados: {
  nome: string;
  email: string;
  telefone: string;
}) {
  if (!dados.nome || dados.nome.trim() === "") {
    throw new Error("Nome é obrigatório");
  }

  if (!dados.email || dados.email.trim() === "") {
    throw new Error("E-mail é obrigatório");
  }

  if (!dados.telefone || dados.telefone.trim() === "") {
    throw new Error("Telefone é obrigatório");
  }
}