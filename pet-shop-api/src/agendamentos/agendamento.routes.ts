import { Router } from "express";

import { exigirAutenticacao } from "../auth/auth.middleware";

import {
  alterarStatusDoAgendamentoDoUsuario,
  buscarAgendamentoDoUsuario,
  cadastrarAgendamentoDoUsuario,
  editarAgendamentoDoUsuario,
  listarAgendamentosDoUsuario,
} from "./agendamento.service";

const router = Router();

router.get("/", exigirAutenticacao, async (_request, response) => {
  try {
    const { id, perfil } = response.locals.auth;

    const agendamentos = await listarAgendamentosDoUsuario(
      id,
      perfil,
    );

    response.json(agendamentos);
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao listar agendamentos",
    });
  }
});

router.get("/:id", exigirAutenticacao, async (request, response) => {
  try {
    const agendamentoId = Number(request.params.id);
    const { id: usuarioId, perfil } = response.locals.auth;

    const agendamento = await buscarAgendamentoDoUsuario(
      agendamentoId,
      usuarioId,
      perfil,
    );

    response.json(agendamento);
  } catch (error) {
    if (error instanceof Error) {
      const status =
        error.message === "Agendamento não encontrado"
          ? 404
          : 400;

      response.status(status).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao consultar agendamento",
    });
  }
});

router.post("/", exigirAutenticacao, async (request, response) => {
  try {
    const { id: usuarioId, perfil } = response.locals.auth;

    const {
      dataHora,
      observacoes,
      petId,
      servicoId,
      profissionalId,
    } = request.body;

    const agendamento = await cadastrarAgendamentoDoUsuario(
      usuarioId,
      perfil,
      {
        dataHora: new Date(dataHora),
        observacoes,
        petId: Number(petId),
        servicoId: Number(servicoId),
        profissionalId: Number(profissionalId),
      },
    );

    response.status(201).json(agendamento);
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao cadastrar agendamento",
    });
  }
});

router.put("/:id", exigirAutenticacao, async (request, response) => {
  try {
    const agendamentoId = Number(request.params.id);
    const { id: usuarioId, perfil } = response.locals.auth;

    const {
      dataHora,
      observacoes,
      petId,
      servicoId,
      profissionalId,
    } = request.body;

    const agendamento = await editarAgendamentoDoUsuario(
      agendamentoId,
      usuarioId,
      perfil,
      {
        dataHora: new Date(dataHora),
        observacoes,
        petId: Number(petId),
        servicoId: Number(servicoId),
        profissionalId: Number(profissionalId),
      },
    );

    response.json(agendamento);
  } catch (error) {
    if (error instanceof Error) {
      const status =
        error.message === "Agendamento não encontrado"
          ? 404
          : 400;

      response.status(status).json({
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      message: "Erro interno ao atualizar agendamento",
    });
  }
});

router.patch(
  "/:id/status",
  exigirAutenticacao,
  async (request, response) => {
    try {
      const agendamentoId = Number(request.params.id);
      const { id: usuarioId, perfil } = response.locals.auth;
      const { status } = request.body;

      const agendamento =
        await alterarStatusDoAgendamentoDoUsuario(
          agendamentoId,
          usuarioId,
          perfil,
          status,
        );

      response.json(agendamento);
    } catch (error) {
      if (error instanceof Error) {
        const statusCode =
          error.message === "Agendamento não encontrado"
            ? 404
            : 400;

        response.status(statusCode).json({
          message: error.message,
        });

        return;
      }

      response.status(500).json({
        message: "Erro interno ao alterar status do agendamento",
      });
    }
  },
);

export default router;