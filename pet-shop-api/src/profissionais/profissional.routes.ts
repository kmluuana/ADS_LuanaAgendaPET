import { Router } from "express";

import {
  exigirAutenticacao,
  exigirPerfil,
} from "../auth/auth.middleware";

import {
  alterarStatusProfissional,
  buscarProfissionalPorId,
  buscarProfissionais,
  cadastrarProfissional,
  editarProfissional,
} from "./profissional.service";

import {
  buscarProfissionaisDoServico,
  buscarServicosDoProfissional,
  desvincularServicoDoProfissional,
  vincularServicoAoProfissional,
} from "./profissional-servico.service";

const router = Router();

router.use(exigirAutenticacao);

/*
 * Usado no agendamento.
 *
 * CLIENTE também precisa acessar essa rota.
 */
router.get(
  "/por-servico/:servicoId",
  async (request, response) => {
    try {
      const servicoId = Number(
        request.params.servicoId,
      );

      const profissionais =
        await buscarProfissionaisDoServico(
          servicoId,
        );

      response.json(
        profissionais,
      );
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar profissionais do serviço",
      });
    }
  },
);

/*
 * A partir daqui:
 *
 * ATENDENTE e ADMINISTRADOR
 * podem acessar.
 */
router.use(
  exigirPerfil(
    "ATENDENTE",
    "ADMINISTRADOR",
  ),
);

/*
 * Lista todos os profissionais.
 */
router.get(
  "/",
  async (_request, response) => {
    try {
      const profissionais =
        await buscarProfissionais();

      response.json(
        profissionais,
      );
    } catch (error) {
      response.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar profissionais",
      });
    }
  },
);

/*
 * Busca profissional pelo ID.
 */
router.get(
  "/:id",
  async (request, response) => {
    try {
      const id = Number(
        request.params.id,
      );

      const profissional =
        await buscarProfissionalPorId(
          id,
        );

      response.json(
        profissional,
      );
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar profissional",
      });
    }
  },
);

/*
 * Cadastra profissional.
 */
router.post(
  "/",
  async (request, response) => {
    try {
      const profissional =
        await cadastrarProfissional({
          nome:
            request.body.nome,

          email:
            request.body.email,

          telefone:
            request.body.telefone,
        });

      response
        .status(201)
        .json(
          profissional,
        );
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao cadastrar profissional",
      });
    }
  },
);

/*
 * Edita profissional.
 */
router.put(
  "/:id",
  async (request, response) => {
    try {
      const id = Number(
        request.params.id,
      );

      const profissional =
        await editarProfissional(
          id,
          {
            nome:
              request.body.nome,

            email:
              request.body.email,

            telefone:
              request.body.telefone,
          },
        );

      response.json(
        profissional,
      );
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao editar profissional",
      });
    }
  },
);

/*
 * Ativa ou inativa profissional.
 */
router.patch(
  "/:id/status",
  async (request, response) => {
    try {
      const id = Number(
        request.params.id,
      );

      const profissional =
        await alterarStatusProfissional(
          id,
          request.body.ativo,
        );

      response.json(
        profissional,
      );
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao alterar status do profissional",
      });
    }
  },
);

/*
 * Lista serviços do profissional.
 */
router.get(
  "/:id/servicos",
  async (request, response) => {
    try {
      const profissionalId =
        Number(
          request.params.id,
        );

      const servicos =
        await buscarServicosDoProfissional(
          profissionalId,
        );

      response.json(
        servicos,
      );
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar serviços do profissional",
      });
    }
  },
);

/*
 * Vincula serviço ao profissional.
 */
router.post(
  "/:id/servicos/:servicoId",
  async (request, response) => {
    try {
      const profissionalId =
        Number(
          request.params.id,
        );

      const servicoId =
        Number(
          request.params.servicoId,
        );

      const vinculo =
        await vincularServicoAoProfissional(
          profissionalId,
          servicoId,
        );

      response
        .status(201)
        .json(
          vinculo,
        );
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao vincular serviço ao profissional",
      });
    }
  },
);

/*
 * Remove vínculo entre
 * profissional e serviço.
 */
router.delete(
  "/:id/servicos/:servicoId",
  async (request, response) => {
    try {
      const profissionalId =
        Number(
          request.params.id,
        );

      const servicoId =
        Number(
          request.params.servicoId,
        );

      await desvincularServicoDoProfissional(
        profissionalId,
        servicoId,
      );

      response
        .status(204)
        .send();
    } catch (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao remover serviço do profissional",
      });
    }
  },
);

export default router;