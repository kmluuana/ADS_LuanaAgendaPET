import { Router } from "express";

import {
  exigirAutenticacao,
  exigirPerfil,
} from "../auth/auth.middleware";

import {
  buscarLembretes24hPendentes,
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
 * Endpoint temporário para testar
 * quais agendamentos receberiam
 * o lembrete de 24 horas.
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

export default router;