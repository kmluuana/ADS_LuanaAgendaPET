import {
  adicionarServicoAoProfissional,
  listarServicosDoProfissional,
  obterRelacaoProfissionalServico,
  removerServicoDoProfissional,
} from "./profissional-servico.repository";

import { obterProfissionalPorId } from "./profissional.repository";
import { obterServicoPorId } from "../servicos/servico.repository";

export async function vincularServicoAoProfissional(
  profissionalId: number,
  servicoId: number,
) {
  const profissional = await obterProfissionalPorId(profissionalId);

  if (!profissional) {
    throw new Error("Profissional não encontrado");
  }

  const servico = await obterServicoPorId(servicoId);

  if (!servico) {
    throw new Error("Serviço não encontrado");
  }

  const relacaoExistente = await obterRelacaoProfissionalServico(
    profissionalId,
    servicoId,
  );

  if (relacaoExistente) {
    throw new Error(
      "Este serviço já está vinculado ao profissional",
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
  const profissional = await obterProfissionalPorId(profissionalId);

  if (!profissional) {
    return null;
  }

  return listarServicosDoProfissional(profissionalId);
}

export async function desvincularServicoDoProfissional(
  profissionalId: number,
  servicoId: number,
) {
  const relacao = await obterRelacaoProfissionalServico(
    profissionalId,
    servicoId,
  );

  if (!relacao) {
    return null;
  }

  return removerServicoDoProfissional(
    profissionalId,
    servicoId,
  );
}