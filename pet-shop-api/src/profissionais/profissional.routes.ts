import { Router } from "express";

import {
  buscarProfissionaisDoServico,
  buscarServicosDoProfissional,
  desvincularServicoDoProfissional,
  vincularServicoAoProfissional,
} from "./profissional-servico.service";

const router = Router();

router.get(
  "/por-servico/:servicoId",
  async (
    request,
    response,
  ) => {
    try {
      const servicoId =
        Number(
          request.params.servicoId,
        );

      const profissionais =
        await buscarProfissionaisDoServico(
          servicoId,
        );

      response.json(
        profissionais,
      );
    } catch (error) {
      if (error instanceof Error) {
        response
          .status(400)
          .json({
            message:
              error.message,
          });

        return;
      }

      response
        .status(500)
        .json({
          message:
            "Erro interno ao consultar profissionais do serviço",
        });
    }
  },
);

router.get(
  "/:id/servicos",
  async (
    request,
    response,
  ) => {
    try {
      const profissionalId =
        Number(
          request.params.id,
        );

      const servicos =
        await buscarServicosDoProfissional(
          profissionalId,
        );

      response.json(
        servicos,
      );
    } catch (error) {
      if (error instanceof Error) {
        response
          .status(400)
          .json({
            message:
              error.message,
          });

        return;
      }

      response
        .status(500)
        .json({
          message:
            "Erro interno ao consultar serviços do profissional",
        });
    }
  },
);

router.post(
  "/:id/servicos/:servicoId",
  async (
    request,
    response,
  ) => {
    try {
      const profissionalId =
        Number(
          request.params.id,
        );

      const servicoId =
        Number(
          request.params.servicoId,
        );

      const vinculo =
        await vincularServicoAoProfissional(
          profissionalId,
          servicoId,
        );

      response
        .status(201)
        .json(vinculo);
    } catch (error) {
      if (error instanceof Error) {
        response
          .status(400)
          .json({
            message:
              error.message,
          });

        return;
      }

      response
        .status(500)
        .json({
          message:
            "Erro interno ao vincular serviço ao profissional",
        });
    }
  },
);

router.delete(
  "/:id/servicos/:servicoId",
  async (
    request,
    response,
  ) => {
    try {
      const profissionalId =
        Number(
          request.params.id,
        );

      const servicoId =
        Number(
          request.params.servicoId,
        );

      await desvincularServicoDoProfissional(
        profissionalId,
        servicoId,
      );

      response
        .status(204)
        .send();
    } catch (error) {
      if (error instanceof Error) {
        response
          .status(400)
          .json({
            message:
              error.message,
          });

        return;
      }

      response
        .status(500)
        .json({
          message:
            "Erro interno ao desvincular serviço do profissional",
        });
    }
  },
);

export default router;