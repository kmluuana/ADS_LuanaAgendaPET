
import app from "./app";
import { iniciarJobLembretes } from "./lembrete/lembrete.job";

const port = Number(process.env.PORT) || 3333;

const server = app.listen(port, () => {
  console.log(
    `Pet Shop API running on http://localhost:${port}`,
  );

  if (process.env.LEMBRETES_JOB_ENABLED === "true") {
    iniciarJobLembretes();
  } else {
    console.log(
      "[LEMBRETES] Job automático desabilitado",
    );
  }
});
