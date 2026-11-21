import { Router } from "express";

import {
  exigirAutenticacao,
  exigirPerfil,
} from "../auth/auth.middleware";

import {
  buscarLembretes24hPendentes,
  processarLembretes24h,
} from "./lembrete.service";

const router = Router();

// Todas as rotas exigem autenticação de administrador
router.use(
  exigirAutenticacao,
  exigirPerfil("ADMINISTRADOR"),
);

/**
 * Consulta os agendamentos que possuem
 * lembretes de 24 horas pendentes.
 *
 * Não envia mensagens.
 */
router.get("/pendentes", async (_request, response) => {
  try {
    const lembretes = await buscarLembretes24hPendentes();

    response.json({
      quantidade: lembretes.length,
      lembretes,
    });
  } catch (error) {
    console.error("Erro ao buscar lembretes:", error);

    response.status(500).json({
      message: "Erro ao buscar lembretes pendentes",
    });
  }
});

/**
 * Processa os lembretes pendentes.
 *
 * Busca agendamentos, envia mensagens
 * pelo WhatsApp e registra o resultado.
 */
router.post("/processar", async (_request, response) => {
  try {
    const resultado = await processarLembretes24h();

    response.status(200).json({
      message: "Processamento de lembretes finalizado",
      resultado,
    });
  } catch (error) {
    console.error("Erro ao processar lembretes:", error);

    response.status(500).json({
      message: "Erro interno ao processar lembretes",
    });
  }
});

export default router;