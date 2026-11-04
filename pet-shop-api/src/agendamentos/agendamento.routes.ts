import { Router } from "express";

import {
  alterarStatusDoAgendamento,
  buscarAgendamentoPorId,
  buscarAgendamentos,
  cadastrarAgendamento,
  editarAgendamento,
} from "./agendamento.service";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const agendamentos = await buscarAgendamentos();

    response.json(agendamentos);
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

    const agendamento = await buscarAgendamentoPorId(id);

    if (!agendamento) {
      response.status(404).json({
        message: "Agendamento não encontrado",
      });

      return;
    }

    response.json(agendamento);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const {
      dataHora,
      observacoes,
      petId,
      servicoId,
      profissionalId,
    } = request.body;

    const agendamento = await cadastrarAgendamento({
      dataHora: new Date(dataHora),
      observacoes,
      petId,
      servicoId,
      profissionalId,
    });

    response.status(201).json(agendamento);
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
      dataHora,
      observacoes,
      petId,
      servicoId,
      profissionalId,
    } = request.body;

    const agendamento = await editarAgendamento(id, {
      dataHora: new Date(dataHora),
      observacoes,
      petId,
      servicoId,
      profissionalId,
    });

    if (!agendamento) {
      response.status(404).json({
        message: "Agendamento não encontrado",
      });

      return;
    }

    response.json(agendamento);
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

router.patch("/:id/status", async (request, response, next) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({
        message: "Id inválido",
      });

      return;
    }

    const { status } = request.body;

    if (
      status !== "AGENDADO" &&
      status !== "CONCLUIDO" &&
      status !== "CANCELADO"
    ) {
      response.status(400).json({
        message: "Status inválido",
      });

      return;
    }

    const agendamento = await alterarStatusDoAgendamento(
      id,
      status,
    );

    if (!agendamento) {
      response.status(404).json({
        message: "Agendamento não encontrado",
      });

      return;
    }

    response.json(agendamento);
  } catch (error) {
    next(error);
  }
});

export default router;