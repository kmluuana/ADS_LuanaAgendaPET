import { Router } from "express";

import { exigirAutenticacao } from "../auth/auth.middleware";

import {
  alterarStatusPetDoUsuario,
  buscarPetDoUsuario,
  cadastrarPetDoUsuario,
  editarPetDoUsuario,
  listarPetsDoUsuario,
} from "./pet.service";

const router = Router();

router.get("/", exigirAutenticacao, async (_request, response) => {
  try {
    const { id, perfil } = response.locals.auth;

    const pets = await listarPetsDoUsuario(id, perfil);

    response.json(pets);
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao listar pets",
    });
  }
});

router.get("/:id", exigirAutenticacao, async (request, response) => {
  try {
    const petId = Number(request.params.id);
    const { id: usuarioId, perfil } = response.locals.auth;

    const pet = await buscarPetDoUsuario(
      petId,
      usuarioId,
      perfil,
    );

    response.json(pet);
  } catch (error) {
    if (error instanceof Error) {
      const status =
        error.message === "Pet não encontrado"
          ? 404
          : 400;

      response.status(status).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao consultar pet",
    });
  }
});

router.post("/", exigirAutenticacao, async (request, response) => {
  try {
    const { id: usuarioId, perfil } = response.locals.auth;

    const {
      nome,
      especie,
      raca,
      dataNascimento,
      observacoes,
      clienteId,
    } = request.body;

    const pet = await cadastrarPetDoUsuario(
      usuarioId,
      perfil,
      {
        nome,
        especie,
        raca,
        dataNascimento: dataNascimento
          ? new Date(dataNascimento)
          : undefined,
        observacoes,
        clienteId: clienteId
          ? Number(clienteId)
          : undefined,
      },
    );

    response.status(201).json(pet);
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao cadastrar pet",
    });
  }
});

router.put("/:id", exigirAutenticacao, async (request, response) => {
  try {
    const petId = Number(request.params.id);
    const { id: usuarioId, perfil } = response.locals.auth;

    const {
      nome,
      especie,
      raca,
      dataNascimento,
      observacoes,
      clienteId,
    } = request.body;

    const pet = await editarPetDoUsuario(
      petId,
      usuarioId,
      perfil,
      {
        nome,
        especie,
        raca,
        dataNascimento: dataNascimento
          ? new Date(dataNascimento)
          : undefined,
        observacoes,
        clienteId: clienteId
          ? Number(clienteId)
          : undefined,
      },
    );

    response.json(pet);
  } catch (error) {
    if (error instanceof Error) {
      const status =
        error.message === "Pet não encontrado"
          ? 404
          : 400;

      response.status(status).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao atualizar pet",
    });
  }
});

router.patch(
  "/:id/ativo",
  exigirAutenticacao,
  async (request, response) => {
    try {
      const petId = Number(request.params.id);
      const { id: usuarioId, perfil } = response.locals.auth;
      const { ativo } = request.body;

      const pet = await alterarStatusPetDoUsuario(
        petId,
        usuarioId,
        perfil,
        ativo,
      );

      response.json(pet);
    } catch (error) {
      if (error instanceof Error) {
        const status =
          error.message === "Pet não encontrado"
            ? 404
            : 400;

        response.status(status).json({
          message: error.message,
        });

        return;
      }

      response.status(500).json({
        message: "Erro interno ao alterar status do pet",
      });
    }
  },
);

export default router;