import { Router } from "express";

import {
  exigirAutenticacao,
  exigirPerfil,
} from "../auth/auth.middleware";

import {
  alterarStatusServico,
  buscarServicoPorId,
  buscarServicos,
  cadastrarServico,
  editarServico,
} from "./servico.service";

const router = Router();

router.use(
  exigirAutenticacao,
);

/**
 * Consulta todos os serviços.
 *
 * CLIENTE também precisa acessar
 * essa rota para fazer agendamentos.
 */
router.get(
  "/",
  async (_request, response) => {
    try {
      const servicos =
        await buscarServicos();

      response.json(
        servicos,
      );
    } catch (error) {
      response
        .status(500)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao buscar serviços",
        });
    }
  },
);

/**
 * Consulta um serviço pelo ID.
 */
router.get(
  "/:id",
  async (request, response) => {
    try {
      const id =
        Number(
          request.params.id,
        );

      const servico =
        await buscarServicoPorId(
          id,
        );

      response.json(
        servico,
      );
    } catch (error) {
      response
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao buscar serviço",
        });
    }
  },
);

/**
 * A partir daqui:
 *
 * somente ADMINISTRADOR
 * pode alterar serviços.
 */
router.use(
  exigirPerfil(
    "ADMINISTRADOR",
  ),
);

/**
 * Cadastra um novo serviço.
 */
router.post(
  "/",
  async (request, response) => {
    try {
      const servico =
        await cadastrarServico({
          nome:
            request.body.nome,

          descricao:
            request.body.descricao,

          preco:
            Number(
              request.body.preco,
            ),

          duracao:
            Number(
              request.body.duracao,
            ),
        });

      response
        .status(201)
        .json(
          servico,
        );
    } catch (error) {
      response
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao cadastrar serviço",
        });
    }
  },
);

/**
 * Edita um serviço.
 */
router.put(
  "/:id",
  async (request, response) => {
    try {
      const id =
        Number(
          request.params.id,
        );

      const servico =
        await editarServico(
          id,
          {
            nome:
              request.body.nome,

            descricao:
              request.body.descricao,

            preco:
              Number(
                request.body.preco,
              ),

            duracao:
              Number(
                request.body.duracao,
              ),
          },
        );

      response.json(
        servico,
      );
    } catch (error) {
      response
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao editar serviço",
        });
    }
  },
);

/**
 * Ativa ou inativa um serviço.
 */
router.patch(
  "/:id/ativo",
  async (request, response) => {
    try {
      const id =
        Number(
          request.params.id,
        );

      const servico =
        await alterarStatusServico(
          id,
          request.body.ativo,
        );

      response.json(
        servico,
      );
    } catch (error) {
      response
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao alterar status do serviço",
        });
    }
  },
);

export default router;