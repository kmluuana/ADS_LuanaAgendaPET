import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";

export default function EditPetPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPet() {
      try {
        const response = await fetch(`/api/pets/${id}`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setErro(data.message ?? "Não foi possível carregar o pet");
          return;
        }

        setNome(data.nome);
        setEspecie(data.especie);
        setRaca(data.raca ?? "");
        setObservacoes(data.observacoes ?? "");

        if (data.dataNascimento) {
          setDataNascimento(
            new Date(data.dataNascimento)
              .toISOString()
              .split("T")[0],
          );
        }
      } catch {
        setErro("Não foi possível conectar com a API");
      } finally {
        setCarregando(false);
      }
    }

    carregarPet();
  }, [id]);

  async function salvar(event: FormEvent) {
    event.preventDefault();

    setErro("");
    setSalvando(true);

    try {
      const response = await fetch(`/api/pets/${id}`, {
        method: "PUT",
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
        setErro(data.message ?? "Não foi possível atualizar o pet");
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

  if (carregando) {
    return <p>Carregando pet...</p>;
  }

  return (
    <main>
      <h1>Editar Pet</h1>

      <Link to="/pets">Voltar para meus pets</Link>

      <form onSubmit={salvar}>
        <div>
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="especie">Espécie</label>
          <input
            id="especie"
            value={especie}
            onChange={(event) => setEspecie(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="raca">Raça</label>
          <input
            id="raca"
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
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      {erro && <p>{erro}</p>}
    </main>
  );
}