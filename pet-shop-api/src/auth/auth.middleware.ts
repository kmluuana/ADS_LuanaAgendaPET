import type { NextFunction, Request, Response } from "express";

import { validarTokenUsuario } from "./token.service";

export async function exigirAutenticacao(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = request.cookies?.agenda_pet_session;

  if (!token) {
    response.status(401).json({
      message: "Usuário não autenticado",
    });

    return;
  }

  try {
    const autenticacao = await validarTokenUsuario(token);

    response.locals.auth = autenticacao;

    next();
  } catch {
    response.status(401).json({
      message: "Sessão inválida ou expirada",
    });
  }
}