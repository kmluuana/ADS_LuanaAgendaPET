import { Router } from "express";

import {
  exigirAutenticacao,
  exigirPerfil,
} from "../auth/auth.middleware";

import {
  buscarLembretes24hPendentes,
  processarLembretes24h,
} from "./lembrete.service";

const router = Router();

router.use(
  exigirAutenticacao,
);

router.use(
  exigirPerfil(
    "ADMINISTRADOR",
  ),
);

/**
 * Consulta quais agendamentos
 * estão pendentes de lembrete.
 */
router.get(
  "/pendentes",
  async (_request, response) => {
    try {
      const lembretes =
        await buscarLembretes24hPendentes();

      response.json({
        quantidade:
          lembretes.length,

        lembretes,
      });
    } catch (error) {
      response
        .status(500)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao buscar lembretes pendentes",
        });
    }
  },
);

/**
 * Processa manualmente os
 * lembretes pendentes.
 *
 * Depois o job automático
 * chamará o mesmo service.
 */
router.post(
  "/processar",
  async (_request, response) => {
    try {
      const resultado =
        await processarLembretes24h();

      response.json(
        resultado,
      );
    } catch (error) {
      response
        .status(500)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao processar lembretes",
        });
    }
  },
);

export default router;