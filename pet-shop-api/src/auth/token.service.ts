import "dotenv/config";

import { SignJWT, jwtVerify } from "jose";

type PerfilUsuario = "CLIENTE" | "ATENDENTE" | "ADMINISTRADOR";

const issuer = "agenda-pet-api";
const audience = "agenda-pet-web";

function obterChaveJwt() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET não configurado");
  }

  return new TextEncoder().encode(jwtSecret);
}

export async function gerarTokenUsuario(usuario: {
  id: number;
  perfil: PerfilUsuario;
}) {
  return new SignJWT({
    perfil: usuario.perfil,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(String(usuario.id))
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(obterChaveJwt());
}

export async function validarTokenUsuario(token: string) {
  const { payload } = await jwtVerify(token, obterChaveJwt(), {
    issuer,
    audience,
  });

  if (!payload.sub) {
    throw new Error("Token sem usuário");
  }

  const perfil = payload.perfil;

  if (
    perfil !== "CLIENTE" &&
    perfil !== "ATENDENTE" &&
    perfil !== "ADMINISTRADOR"
  ) {
    throw new Error("Perfil inválido");
  }

  return {
    id: Number(payload.sub),
    perfil,
  };
}