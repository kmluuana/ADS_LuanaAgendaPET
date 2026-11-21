
import cron from "node-cron";
import { processarLembretes24h } from "./lembrete.service";

let emProcessamento = false;

export function iniciarJobLembretes(): void {
  cron.schedule("*/5 * * * *", async () => {
    if (emProcessamento) {
      console.log(
        "[LEMBRETES] Processamento anterior ainda em execução",
      );
      return;
    }

    emProcessamento = true;

    try {
      console.log("[LEMBRETES] Iniciando processamento");

      const resultado = await processarLembretes24h();

      console.log("[LEMBRETES] Finalizado:", resultado);
    } catch (error) {
      console.error(
        "[LEMBRETES] Erro no processamento:",
        error,
      );
    } finally {
      emProcessamento = false;
    }
  });

  console.log("[LEMBRETES] Job agendado a cada 5 minutos");
}
