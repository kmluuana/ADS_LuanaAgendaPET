import { db } from "../prisma/db";

export async function obterUsuarioPorGoogleId(googleId: string) {
  return db.usuario.findUnique({
    where: {
      googleId,
    },
  });
}

export async function obterUsuarioPorEmail(email: string) {
  return db.usuario.findUnique({
    where: {
      email,
    },
  });
}

export async function criarUsuario(dados: {
  googleId: string;
  nome: string;
  email: string;
}) {
  return db.usuario.create({
    data: {
      googleId: dados.googleId,
      nome: dados.nome,
      email: dados.email,
    },
  });
}

export async function atualizarDadosGoogle(
  id: number,
  dados: {
    nome: string;
    email: string;
  },
) {
  return db.usuario.update({
    where: {
      id,
    },
    data: {
      nome: dados.nome,
      email: dados.email,
    },
  });
}

export async function atualizarPerfilUsuario(
  id: number,
  perfil: "CLIENTE" | "ATENDENTE" | "ADMINISTRADOR",
) {
  return db.usuario.update({
    where: {
      id,
    },
    data: {
      perfil,
    },
  });
}

export async function atualizarStatusUsuario(
  id: number,
  ativo: boolean,
) {
  return db.usuario.update({
    where: {
      id,
    },
    data: {
      ativo,
    },
  });
}