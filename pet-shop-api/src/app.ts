import express from "express";

import clienteRoutes from "./clientes/cliente.routes";
import petRoutes from "./pets/pet.routes";
import servicoRoutes from "./servicos/servico.routes";
import profissionalRoutes from "./profissionais/profissional.routes";

const app = express();


app.use(express.json());

app.use("/pets", petRoutes);
app.use("/clientes", clienteRoutes);
app.use("/servicos", servicoRoutes);
app.use("/profissionais", profissionalRoutes);

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "pet-shop-api",
  });
});

export default app;