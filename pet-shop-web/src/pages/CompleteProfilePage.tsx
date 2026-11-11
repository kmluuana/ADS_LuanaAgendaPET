import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

export default function CompleteProfilePage() {
  const navigate = useNavigate();

  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function completarCadastro(event: FormEvent) {
    event.preventDefault();

    setErro("");
    setSalvando(true);

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.message ?? "Não foi possível completar o cadastro");
        return;
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch {
      setErro("Não foi possível conectar com a API");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main>
      <h1>Complete seu cadastro</h1>

      <p>
        Precisamos apenas do seu telefone para finalizar seu cadastro.
      </p>

      <form onSubmit={completarCadastro}>
        <label htmlFor="telefone">
          Telefone
        </label>

        <input
          id="telefone"
          type="tel"
          value={telefone}
          onChange={(event) => setTelefone(event.target.value)}
          placeholder="(54) 99999-9999"
          required
        />

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Continuar"}
        </button>
      </form>

      {erro && <p>{erro}</p>}
    </main>
  );
}