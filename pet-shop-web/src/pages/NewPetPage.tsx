import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

export default function NewPetPage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function cadastrarPet(event: FormEvent) {
    event.preventDefault();

    setErro("");
    setSalvando(true);

    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          especie,
          raca: raca || undefined,
          dataNascimento: dataNascimento || undefined,
          observacoes: observacoes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.message ?? "Não foi possível cadastrar o pet");
        return;
      }

      navigate("/pets", {
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
      <h1>Novo Pet</h1>

      <Link to="/pets">Voltar para meus pets</Link>

      <form onSubmit={cadastrarPet}>
        <div>
          <label htmlFor="nome">Nome</label>

          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="especie">Espécie</label>

          <input
            id="especie"
            type="text"
            value={especie}
            onChange={(event) => setEspecie(event.target.value)}
            placeholder="Cachorro, Gato..."
            required
          />
        </div>

        <div>
          <label htmlFor="raca">Raça</label>

          <input
            id="raca"
            type="text"
            value={raca}
            onChange={(event) => setRaca(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="dataNascimento">
            Data de nascimento
          </label>

          <input
            id="dataNascimento"
            type="date"
            value={dataNascimento}
            onChange={(event) =>
              setDataNascimento(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="observacoes">Observações</label>

          <textarea
            id="observacoes"
            value={observacoes}
            onChange={(event) =>
              setObservacoes(event.target.value)
            }
          />
        </div>

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Cadastrar pet"}
        </button>
      </form>

      {erro && <p>{erro}</p>}
    </main>
  );
}