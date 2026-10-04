import app from "./app";

const port = Number(process.env.PORT) || 3333;

app.listen(port, () => {
  console.log(`Pet Shop API running on http://localhost:${port}`);
});
