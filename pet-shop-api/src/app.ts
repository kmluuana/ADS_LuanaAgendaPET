import express from "express";
import servicoRoutes from "./servicos/servico.routes";

const app = express();

app.use(express.json());
app.use("/servicos", servicoRoutes);

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "pet-shop-api",
  });
});

export default app;
