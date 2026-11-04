import { Router } from "express";

import { autenticarComGoogle } from "./auth.service";

const router = Router();

router.post("/google", async (request, response) => {
  try {
    const { idToken } = request.body;

    const usuario = await autenticarComGoogle(idToken);

    response.json({
      usuario,
    });
  } catch (error) {
    if (error instanceof Error) {
      response.status(401).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao autenticar usuário",
    });
  }
});

export default router;
