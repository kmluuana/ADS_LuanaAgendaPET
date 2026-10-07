import { Router } from "express";

import {
  alterarStatusPet,
  buscarPetPorId,
  buscarPets,
  cadastrarPet,
  editarPet,
} from "./pet.service";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const pets = await buscarPets();

    response.json(pets);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        message: "Id inválido",
      });

      return;
    }

    const pet = await buscarPetPorId(id);

    if (!pet) {
      response.status(404).json({
        message: "Pet não encontrado",
      });

      return;
    }

    response.json(pet);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const {
      nome,
      especie,
      raca,
      dataNascimento,
      observacoes,
      clienteId,
    } = request.body;

    const pet = await cadastrarPet({
      nome,
      especie,
      raca,
      dataNascimento: dataNascimento
        ? new Date(dataNascimento)
        : undefined,
      observacoes,
      clienteId,
    });

    response.status(201).json(pet);
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({
        message: error.message,
      });

      return;
    }

    next(error);
  }
});

router.put("/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        message: "Id inválido",
      });

      return;
    }

    const {
      nome,
      especie,
      raca,
      dataNascimento,
      observacoes,
      clienteId,
    } = request.body;

    const pet = await editarPet(id, {
      nome,
      especie,
      raca,
      dataNascimento: dataNascimento
        ? new Date(dataNascimento)
        : undefined,
      observacoes,
      clienteId,
    });

    if (!pet) {
      response.status(404).json({
        message: "Pet não encontrado",
      });

      return;
    }

    response.json(pet);
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({
        message: error.message,
      });

      return;
    }

    next(error);
  }
});

router.patch("/:id/ativo", async (request, response, next) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        message: "Id inválido",
      });

      return;
    }

    const { ativo } = request.body;

    if (typeof ativo !== "boolean") {
      response.status(400).json({
        message: "O campo ativo deve ser true ou false",
      });

      return;
    }

    const pet = await alterarStatusPet(id, ativo);

    if (!pet) {
      response.status(404).json({
        message: "Pet não encontrado",
      });

      return;
    }

    response.json(pet);
  } catch (error) {
    next(error);
  }
});

export default router;