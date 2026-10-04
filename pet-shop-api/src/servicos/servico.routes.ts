import { Router } from "express";

import {
  alterarStatusServico,
  buscarServicoPorId,
  buscarServicos,
  cadastrarServico,
  editarServico,
} from "./servico.service";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const servicos = await buscarServicos();

    response.json(servicos);
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

    const servico = await buscarServicoPorId(id);

    if (!servico) {
      response.status(404).json({
        message: "Serviço não encontrado",
      });

      return;
    }

    response.json(servico);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const { nome, descricao, preco, duracao } = request.body;

    const servico = await cadastrarServico({
      nome,
      descricao,
      preco,
      duracao,
    });

    response.status(201).json(servico);
  } catch (error) {
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

    const { nome, descricao, preco, duracao } = request.body;

    const servico = await editarServico(id, {
      nome,
      descricao,
      preco,
      duracao,
    });

    if (!servico) {
      response.status(404).json({
        message: "Serviço não encontrado",
      });

      return;
    }

    response.json(servico);
  } catch (error) {
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

    const servico = await alterarStatusServico(id, ativo);

    if (!servico) {
      response.status(404).json({
        message: "Serviço não encontrado",
      });

      return;
    }

    response.json(servico);
  } catch (error) {
    next(error);
  }
});

export default router;