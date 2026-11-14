import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { validarTokenUsuario } from "./token.service";

type PerfilUsuario =
  | "CLIENTE"
  | "ATENDENTE"
  | "ADMINISTRADOR";

export async function exigirAutenticacao(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token =
    request.cookies?.agenda_pet_session;

  if (!token) {
    response.status(401).json({
      message:
        "Usuário não autenticado",
    });

    return;
  }

  try {
    const autenticacao =
      await validarTokenUsuario(
        token,
      );

    response.locals.auth =
      autenticacao;

    next();
  } catch {
    response.status(401).json({
      message:
        "Sessão inválida ou expirada",
    });
  }
}

export function exigirPerfil(
  ...perfisPermitidos: PerfilUsuario[]
) {
  return (
    _request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const autenticacao =
      response.locals.auth;

    if (!autenticacao) {
      response.status(401).json({
        message:
          "Usuário não autenticado",
      });

      return;
    }

    const perfil =
      autenticacao.perfil as
        | PerfilUsuario
        | undefined;

    if (
      !perfil ||
      !perfisPermitidos.includes(
        perfil,
      )
    ) {
      response.status(403).json({
        message:
          "Usuário sem permissão para acessar este recurso",
      });

      return;
    }

    next();
  };
}