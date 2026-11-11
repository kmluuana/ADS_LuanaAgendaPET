import { db } from "../prisma/db";

export async function obterUsuarioPorGoogleId(googleId: string) {
  return db.usuario.findUnique({
    where: { googleId },
  });
}

export async function obterUsuarioPorEmail(email: string) {
  return db.usuario.findUnique({
    where: { email },
  });
}

export async function obterUsuarioPorId(id: number) {
  return db.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      ativo: true,
      clienteId: true,
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
    where: { id },
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
    where: { id },
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
    where: { id },
    data: {
      ativo,
    },
  });
}

export async function criarOuVincularClienteAoUsuario(
  usuarioId: number,
  telefone: string,
) {
  return db.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUnique({
      where: {
        id: usuarioId,
      },
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    if (usuario.clienteId) {
      return tx.cliente.findUnique({
        where: {
          id: usuario.clienteId,
        },
      });
    }

    const clienteExistente = await tx.cliente.findUnique({
      where: {
        email: usuario.email,
      },
      include: {
        usuario: true,
      },
    });

    if (clienteExistente) {
      if (clienteExistente.usuario) {
        throw new Error(
          "Cliente já vinculado a outro usuário",
        );
      }

      await tx.usuario.update({
        where: {
          id: usuario.id,
        },
        data: {
          clienteId: clienteExistente.id,
        },
      });

      return clienteExistente;
    }

    const cliente = await tx.cliente.create({
      data: {
        nome: usuario.nome,
        email: usuario.email,
        telefone,
      },
    });

    await tx.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        clienteId: cliente.id,
      },
    });

    return cliente;
  });
}