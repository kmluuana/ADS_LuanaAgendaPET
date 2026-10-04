import {
  criarCliente,
  listarClientes,
  obterClientePorEmail,
} from "./cliente.repository";

export async function buscarClientes() {
  return listarClientes();
}

export async function cadastrarCliente(dados: {
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

  const clienteExistente = await obterClientePorEmail(dados.email);

  if (clienteExistente) {
    return null;
  }

  return criarCliente(dados);
}