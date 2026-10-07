import { Router } from "express";

import {
  alterarStatusCliente,
  buscarClientePorId,
  buscarClientes,
  cadastrarCliente,
  editarCliente,
} from "./cliente.service";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const clientes = await buscarClientes();

    response.json(clientes);
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

    const cliente = await buscarClientePorId(id);

    if (!cliente) {
      response.status(404).json({
        message: "Cliente não encontrado",
      });

      return;
    }

    response.json(cliente);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const { nome, email, telefone } = request.body;

    const cliente = await cadastrarCliente({
      nome,
      email,
      telefone,
    });

    if (!cliente) {
      response.status(409).json({
        message: "Já existe um cliente com este e-mail",
      });

      return;
    }

    response.status(201).json(cliente);
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

    const cliente = await editarCliente(id, {
      nome,
      email,
      telefone,
    });

    if (!cliente) {
      response.status(404).json({
        message: "Cliente não encontrado",
      });

      return;
    }

    response.json(cliente);
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

    const cliente = await alterarStatusCliente(id, ativo);

    if (!cliente) {
      response.status(404).json({
        message: "Cliente não encontrado",
      });

      return;
    }

    response.json(cliente);
  } catch (error) {
    next(error);
  }
});

export default router;