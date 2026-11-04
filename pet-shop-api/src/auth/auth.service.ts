import { OAuth2Client } from "google-auth-library";

import {
  atualizarDadosGoogle,
  criarUsuario,
  obterUsuarioPorGoogleId,
} from "./auth.repository";

const googleClient = new OAuth2Client();

export async function autenticarComGoogle(idToken: string) {
  if (!idToken || idToken.trim() === "") {
    throw new Error("Token do Google é obrigatório");
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID não configurado");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Token do Google inválido");
  }

  const googleId = payload.sub;
  const email = payload.email;
  const nome = payload.name;

  if (!googleId || !email || !nome) {
    throw new Error("Dados da conta Google incompletos");
  }

  let usuario = await obterUsuarioPorGoogleId(googleId);

  if (!usuario) {
    usuario = await criarUsuario({
      googleId,
      nome,
      email,
    });
  } else {
    usuario = await atualizarDadosGoogle(usuario.id, {
      nome,
      email,
    });
  }

  if (!usuario.ativo) {
    throw new Error("Usuário está inativo");
  }

  return usuario;
}