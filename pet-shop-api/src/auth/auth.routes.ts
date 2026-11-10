import { Router } from "express";

import { exigirAutenticacao } from "./auth.middleware";
import { obterUsuarioPorId } from "./auth.repository";
import { autenticarComGoogle } from "./auth.service";
import { gerarTokenUsuario } from "./token.service";

const router = Router();

router.post("/google", async (request, response) => {
  try {
    const { idToken } = request.body;

    const usuario = await autenticarComGoogle(idToken);

    const token = await gerarTokenUsuario({
      id: usuario.id,
      perfil: usuario.perfil,
    });

    response.cookie("agenda_pet_session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

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

router.get("/me", exigirAutenticacao, async (_request, response) => {
  try {
    const { id } = response.locals.auth;

    const usuario = await obterUsuarioPorId(id);

    if (!usuario || !usuario.ativo) {
      response.status(401).json({
        message: "Usuário não encontrado ou inativo",
      });

      return;
    }

    response.json({
      usuario,
    });
  } catch {
    response.status(500).json({
      message: "Erro interno ao consultar usuário",
    });
  }
});

router.post("/logout", (_request, response) => {
  response.clearCookie("agenda_pet_session", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  response.status(204).send();
});

export default router;