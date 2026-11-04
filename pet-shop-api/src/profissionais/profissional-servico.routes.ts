import { Router } from "express";

import {
  buscarServicosDoProfissional,
  desvincularServicoDoProfissional,
  vincularServicoAoProfissional,
} from "./profissional-servico.service";

const router = Router();

router.get("/:id/servicos", async (request, response, next) => {
  try {
    const profissionalId = Number(request.params.id);

    if (!Number.isInteger(profissionalId) || profissionalId <= 0) {
      response.status(400).json({
        message: "Id do profissional inválido",
      });

      return;
    }

    const servicos =
      await buscarServicosDoProfissional(profissionalId);

    if (!servicos) {
      response.status(404).json({
        message: "Profissional não encontrado",
      });

      return;
    }

    response.json(servicos);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/servicos/:servicoId",
  async (request, response, next) => {
    try {
      const profissionalId = Number(request.params.id);
      const servicoId = Number(request.params.servicoId);

      if (
        !Number.isInteger(profissionalId) ||
        profissionalId <= 0
      ) {
        response.status(400).json({
          message: "Id do profissional inválido",
        });

        return;
      }

      if (!Number.isInteger(servicoId) || servicoId <= 0) {
        response.status(400).json({
          message: "Id do serviço inválido",
        });

        return;
      }

      const relacao = await vincularServicoAoProfissional(
        profissionalId,
        servicoId,
      );

      response.status(201).json(relacao);
    } catch (error) {
      if (error instanceof Error) {
        response.status(400).json({
          message: error.message,
        });

        return;
      }

      next(error);
    }
  },
);

router.delete(
  "/:id/servicos/:servicoId",
  async (request, response, next) => {
    try {
      const profissionalId = Number(request.params.id);
      const servicoId = Number(request.params.servicoId);

      if (
        !Number.isInteger(profissionalId) ||
        profissionalId <= 0
      ) {
        response.status(400).json({
          message: "Id do profissional inválido",
        });

        return;
      }

      if (!Number.isInteger(servicoId) || servicoId <= 0) {
        response.status(400).json({
          message: "Id do serviço inválido",
        });

        return;
      }

      const relacao = await desvincularServicoDoProfissional(
        profissionalId,
        servicoId,
      );

      if (!relacao) {
        response.status(404).json({
          message: "Vínculo não encontrado",
        });

        return;
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;