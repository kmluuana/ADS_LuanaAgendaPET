
import {
  listarLembretes24hPendentes,
  reservarLembrete24h,
  concluirLembrete24hReservado,
} from "../agendamentos/agendamento.repository";

import {
  enviarMensagemWhatsApp,
} from "./zapi.client";

const HORAS_ATE_LEMBRETE = 24;
const JANELA_MINUTOS = 15;

function adicionarHoras(data: Date, horas: number): Date {
  return new Date(
    data.getTime() + horas * 60 * 60 * 1000,
  );
}

function adicionarMinutos(data: Date, minutos: number): Date {
  return new Date(
    data.getTime() + minutos * 60 * 1000,
  );
}

function formatarData(dataHora: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(dataHora);
}

function formatarHorario(dataHora: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(dataHora);
}

export async function buscarLembretes24hPendentes() {
  const agora = new Date();

  const daqui24h = adicionarHoras(
    agora,
    HORAS_ATE_LEMBRETE,
  );

  const inicio = adicionarMinutos(
    daqui24h,
    -JANELA_MINUTOS,
  );

  const fim = adicionarMinutos(
    daqui24h,
    JANELA_MINUTOS,
  );

  return listarLembretes24hPendentes(inicio, fim);
}

function montarMensagem(
  agendamento: Awaited<
    ReturnType<typeof buscarLembretes24hPendentes>
  >[number],
): string {
  return [
    `Olá, ${agendamento.pet.cliente.nome}!`,
    "",
    `Lembrando que ${agendamento.pet.nome} possui um agendamento amanhã.`,
    "",
    `Data: ${formatarData(agendamento.dataHora)}`,
    `Horário: ${formatarHorario(agendamento.dataHora)}`,
    `Serviço: ${agendamento.servico.nome}`,
    `Profissional: ${agendamento.profissional.nome}`,
    "",
    "Agenda Pet",
  ].join("\n");
}

export async function processarLembretes24h() {
  const agendamentos =
    await buscarLembretes24hPendentes();

  let enviados = 0;
  let erros = 0;
  let ignorados = 0;

  for (const agendamento of agendamentos) {
    let reservadoEm: Date | null = null;

    try {
      // Reserva atômica no PostgreSQL
      reservadoEm = await reservarLembrete24h(
        agendamento.id,
      );

      if (!reservadoEm) {
        ignorados++;
        continue;
      }

      const mensagem = montarMensagem(agendamento);

      // Envia mensagem pelo WhatsApp
      await enviarMensagemWhatsApp({
        telefone: agendamento.pet.cliente.telefone,
        mensagem,
      });

      // Confirma o envio no banco
      const concluido =
        await concluirLembrete24hReservado(
          agendamento.id,
          reservadoEm,
        );

      if (!concluido) {
        throw new Error(
          "Não foi possível confirmar o envio no banco",
        );
      }

      enviados++;

      console.log(
        `[LEMBRETE 24H] Enviado: agendamento ${agendamento.id}`,
      );
    } catch (error) {
      erros++;

      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao processar lembrete";

      console.error(
        `[LEMBRETE 24H] Erro no agendamento ${agendamento.id}:`,
        mensagemErro,
      );

      // Mantém a reserva quando existe incerteza
      // sobre o envio, evitando repetição automática.
      if (reservadoEm) {
        console.error(
          `[LEMBRETE 24H] Agendamento ${agendamento.id} requer verificação antes de liberar a reserva.`,
        );
      }
    }
  }

  return {
    encontrados: agendamentos.length,
    enviados,
    erros,
    ignorados,
  };
}
