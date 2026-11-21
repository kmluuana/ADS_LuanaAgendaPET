import {
  listarLembretes24hPendentes,
  marcarLembrete24hEnviado,
  registrarErroLembrete24h,
} from "../agendamentos/agendamento.repository";

import {
  enviarMensagemWhatsApp,
} from "./zapi.client";

const HORAS_ATE_LEMBRETE = 24;
const JANELA_MINUTOS = 15;

function adicionarHoras(
  data: Date,
  horas: number,
) {
  return new Date(
    data.getTime() +
      horas * 60 * 60 * 1000,
  );
}

function adicionarMinutos(
  data: Date,
  minutos: number,
) {
  return new Date(
    data.getTime() +
      minutos * 60 * 1000,
  );
}

function formatarData(
  dataHora: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(dataHora);
}

function formatarHorario(
  dataHora: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(dataHora);
}

export async function buscarLembretes24hPendentes() {
  const agora = new Date();

  const daqui24h =
    adicionarHoras(
      agora,
      HORAS_ATE_LEMBRETE,
    );

  const inicio =
    adicionarMinutos(
      daqui24h,
      -JANELA_MINUTOS,
    );

  const fim =
    adicionarMinutos(
      daqui24h,
      JANELA_MINUTOS,
    );

  return listarLembretes24hPendentes(
    inicio,
    fim,
  );
}

function montarMensagem(
  agendamento: Awaited<
    ReturnType<
      typeof buscarLembretes24hPendentes
    >
  >[number],
) {
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

  for (
    const agendamento
    of agendamentos
  ) {
    try {
      const mensagem =
        montarMensagem(
          agendamento,
        );

      await enviarMensagemWhatsApp({
        telefone:
          agendamento.pet.cliente
            .telefone,

        mensagem,
      });

      await marcarLembrete24hEnviado(
        agendamento.id,
      );

      enviados++;
    } catch (error) {
      erros++;

      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao enviar lembrete";

      await registrarErroLembrete24h(
        agendamento.id,
        mensagemErro,
      );

      console.error(
        `[LEMBRETE 24H] Erro no agendamento ${agendamento.id}:`,
        mensagemErro,
      );
    }
  }

  return {
    encontrados:
      agendamentos.length,

    enviados,

    erros,
  };
}