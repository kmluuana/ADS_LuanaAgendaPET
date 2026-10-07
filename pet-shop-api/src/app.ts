import express from "express";

import clienteRoutes from "./clientes/cliente.routes";
import petRoutes from "./pets/pet.routes";
import servicoRoutes from "./servicos/servico.routes";

const app = express();

console.log("APP ATUAL CARREGADO - COM PETS");

app.use(express.json());

app.use("/pets", petRoutes);
app.use("/clientes", clienteRoutes);
app.use("/servicos", servicoRoutes);

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "pet-shop-api",
  });
});

export default app;