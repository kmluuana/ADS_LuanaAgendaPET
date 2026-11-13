import { obterServicoPorId } from "../servicos/servico.repository";

import {
  obterProfissionalPorId,
} from "./profissional.repository";

import {
  adicionarServicoAoProfissional,
  listarProfissionaisDoServico,
  listarServicosDoProfissional,
  obterRelacaoProfissionalServico,
  removerServicoDoProfissional,
} from "./profissional-servico.repository";

function validarId(
  id: number,
  nome: string,
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      `${nome} inválido`,
    );
  }
}

export async function vincularServicoAoProfissional(
  profissionalId: number,
  servicoId: number,
) {
  validarId(
    profissionalId,
    "Profissional",
  );

  validarId(
    servicoId,
    "Serviço",
  );

  const profissional =
    await obterProfissionalPorId(
      profissionalId,
    );

  if (!profissional) {
    throw new Error(
      "Profissional não encontrado",
    );
  }

  if (!profissional.ativo) {
    throw new Error(
      "Profissional está inativo",
    );
  }

  const servico =
    await obterServicoPorId(
      servicoId,
    );

  if (!servico) {
    throw new Error(
      "Serviço não encontrado",
    );
  }

  if (!servico.ativo) {
    throw new Error(
      "Serviço está inativo",
    );
  }

  const relacaoExistente =
    await obterRelacaoProfissionalServico(
      profissionalId,
      servicoId,
    );

  if (relacaoExistente) {
    throw new Error(
      "Profissional já está vinculado ao serviço",
    );
  }

  return adicionarServicoAoProfissional(
    profissionalId,
    servicoId,
  );
}

export async function buscarServicosDoProfissional(
  profissionalId: number,
) {
  validarId(
    profissionalId,
    "Profissional",
  );

  const profissional =
    await obterProfissionalPorId(
      profissionalId,
    );

  if (!profissional) {
    throw new Error(
      "Profissional não encontrado",
    );
  }

  const relacoes =
    await listarServicosDoProfissional(
      profissionalId,
    );

  return relacoes
    .map(
      (relacao) =>
        relacao.servico,
    )
    .filter(
      (servico) =>
        servico.ativo,
    );
}

export async function buscarProfissionaisDoServico(
  servicoId: number,
) {
  validarId(
    servicoId,
    "Serviço",
  );

  const servico =
    await obterServicoPorId(
      servicoId,
    );

  if (!servico) {
    throw new Error(
      "Serviço não encontrado",
    );
  }

  if (!servico.ativo) {
    throw new Error(
      "Serviço está inativo",
    );
  }

  const relacoes =
    await listarProfissionaisDoServico(
      servicoId,
    );

  return relacoes
    .map(
      (relacao) =>
        relacao.profissional,
    )
    .filter(
      (profissional) =>
        profissional.ativo,
    )
    .sort(
      (a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt-BR",
        ),
    );
}

export async function desvincularServicoDoProfissional(
  profissionalId: number,
  servicoId: number,
) {
  validarId(
    profissionalId,
    "Profissional",
  );

  validarId(
    servicoId,
    "Serviço",
  );

  const relacao =
    await obterRelacaoProfissionalServico(
      profissionalId,
      servicoId,
    );

  if (!relacao) {
    throw new Error(
      "Vínculo entre profissional e serviço não encontrado",
    );
  }

  return removerServicoDoProfissional(
    profissionalId,
    servicoId,
  );
}