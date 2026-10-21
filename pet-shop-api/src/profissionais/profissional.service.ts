import {
  atualizarProfissional,
  atualizarStatusProfissional,
  criarProfissional,
  listarProfissionais,
  obterProfissionalPorEmail,
  obterProfissionalPorId,
} from "./profissional.repository";

export async function buscarProfissionais() {
  return listarProfissionais();
}

export async function buscarProfissionalPorId(id: number) {
  return obterProfissionalPorId(id);
}

export async function cadastrarProfissional(dados: {
  nome: string;
  email: string;
  telefone: string;
}) {
  validarProfissional(dados);

  const profissionalExistente = await obterProfissionalPorEmail(
    dados.email,
  );

  if (profissionalExistente) {
    return null;
  }

  return criarProfissional(dados);
}

export async function editarProfissional(
  id: number,
  dados: {
    nome: string;
    email: string;
    telefone: string;
  },
) {
  const profissional = await obterProfissionalPorId(id);

  if (!profissional) {
    return null;
  }

  validarProfissional(dados);

  const profissionalComEmail = await obterProfissionalPorEmail(
    dados.email,
  );

  if (
    profissionalComEmail &&
    profissionalComEmail.id !== id
  ) {
    throw new Error(
      "Já existe outro profissional com este e-mail",
    );
  }

  return atualizarProfissional(id, dados);
}

export async function alterarStatusProfissional(
  id: number,
  ativo: boolean,
) {
  const profissional = await obterProfissionalPorId(id);

  if (!profissional) {
    return null;
  }

  return atualizarStatusProfissional(id, ativo);
}

function validarProfissional(dados: {
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