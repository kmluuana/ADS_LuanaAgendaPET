import { Router } from "express";

import {
  alterarStatusProfissional,
  buscarProfissionalPorId,
  buscarProfissionais,
  cadastrarProfissional,
  editarProfissional,
} from "./profissional.service";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const profissionais = await buscarProfissionais();

    response.json(profissionais);
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

    const profissional = await buscarProfissionalPorId(id);

    if (!profissional) {
      response.status(404).json({
        message: "Profissional não encontrado",
      });

      return;
    }

    response.json(profissional);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const { nome, email, telefone } = request.body;

    const profissional = await cadastrarProfissional({
      nome,
      email,
      telefone,
    });

    if (!profissional) {
      response.status(409).json({
        message: "Já existe um profissional com este e-mail",
      });

      return;
    }

    response.status(201).json(profissional);
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

    const { nome, email, telefone } = request.body;

    const profissional = await editarProfissional(id, {
      nome,
      email,
      telefone,
    });

    if (!profissional) {
      response.status(404).json({
        message: "Profissional não encontrado",
      });

      return;
    }

    response.json(profissional);
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

    const profissional = await alterarStatusProfissional(id, ativo);

    if (!profissional) {
      response.status(404).json({
        message: "Profissional não encontrado",
      });

      return;
    }

    response.json(profissional);
  } catch (error) {
    next(error);
  }
});

export default router;