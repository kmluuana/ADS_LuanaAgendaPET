import {
  atualizarProfissional,
  atualizarStatusProfissional,
  criarProfissional,
  listarProfissionais,
  obterProfissionalPorEmail,
  obterProfissionalPorId,
} from "./profissional.repository";

type DadosProfissional = {
  nome: string;
  email: string;
  telefone: string;
};

function validarId(id: number) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Profissional inválido",
    );
  }
}

function normalizarNome(
  nome: string,
) {
  return nome.trim();
}

function normalizarEmail(
  email: string,
) {
  return email
    .trim()
    .toLowerCase();
}

function normalizarTelefone(
  telefone: string,
) {
  return telefone.replace(
    /\D/g,
    "",
  );
}

function validarNome(
  nome: string,
) {
  if (!nome) {
    throw new Error(
      "Nome é obrigatório",
    );
  }

  if (nome.length < 3) {
    throw new Error(
      "Nome deve possuir pelo menos 3 caracteres",
    );
  }
}

function validarEmail(
  email: string,
) {
  if (!email) {
    throw new Error(
      "E-mail é obrigatório",
    );
  }

  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailValido.test(email)
  ) {
    throw new Error(
      "E-mail inválido",
    );
  }
}

function validarTelefone(
  telefone: string,
) {
  if (!telefone) {
    throw new Error(
      "Telefone é obrigatório",
    );
  }

  if (
    telefone.length < 10 ||
    telefone.length > 13
  ) {
    throw new Error(
      "Telefone inválido",
    );
  }
}

function prepararDados(
  dados: DadosProfissional,
) {
  const nome =
    normalizarNome(
      dados.nome ?? "",
    );

  const email =
    normalizarEmail(
      dados.email ?? "",
    );

  const telefone =
    normalizarTelefone(
      dados.telefone ?? "",
    );

  validarNome(nome);
  validarEmail(email);
  validarTelefone(telefone);

  return {
    nome,
    email,
    telefone,
  };
}

export async function buscarProfissionais() {
  return listarProfissionais();
}

export async function buscarProfissionalPorId(
  id: number,
) {
  validarId(id);

  const profissional =
    await obterProfissionalPorId(
      id,
    );

  if (!profissional) {
    throw new Error(
      "Profissional não encontrado",
    );
  }

  return profissional;
}

export async function cadastrarProfissional(
  dados: DadosProfissional,
) {
  const dadosTratados =
    prepararDados(dados);

  const profissionalExistente =
    await obterProfissionalPorEmail(
      dadosTratados.email,
    );

  if (profissionalExistente) {
    throw new Error(
      "Já existe um profissional com este e-mail",
    );
  }

  return criarProfissional(
    dadosTratados,
  );
}

export async function editarProfissional(
  id: number,
  dados: DadosProfissional,
) {
  validarId(id);

  const profissional =
    await obterProfissionalPorId(
      id,
    );

  if (!profissional) {
    throw new Error(
      "Profissional não encontrado",
    );
  }

  const dadosTratados =
    prepararDados(dados);

  const profissionalComEmail =
    await obterProfissionalPorEmail(
      dadosTratados.email,
    );

  if (
    profissionalComEmail &&
    profissionalComEmail.id !== id
  ) {
    throw new Error(
      "Já existe um profissional com este e-mail",
    );
  }

  return atualizarProfissional(
    id,
    dadosTratados,
  );
}

export async function alterarStatusProfissional(
  id: number,
  ativo: boolean,
) {
  validarId(id);

  const profissional =
    await obterProfissionalPorId(
      id,
    );

  if (!profissional) {
    throw new Error(
      "Profissional não encontrado",
    );
  }

  if (
    typeof ativo !== "boolean"
  ) {
    throw new Error(
      "Status inválido",
    );
  }

  if (
    profissional.ativo === ativo
  ) {
    return profissional;
  }

  return atualizarStatusProfissional(
    id,
    ativo,
  );
}