import { useEffect, useState } from "react";
import { Link } from "react-router";

type Pet = {
  id: number;
  nome: string;
  especie: string;
  raca?: string | null;
  ativo: boolean;
};

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarPets() {
    try {
      const response = await fetch("/api/pets", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar os pets");
      }

      const data = await response.json();

      setPets(data);
      setErro("");
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPets();
  }, []);

  async function alterarStatus(pet: Pet) {
    try {
      const response = await fetch(
        `/api/pets/${pet.id}/ativo`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ativo: !pet.ativo,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setErro(
          data.message ??
            "Não foi possível alterar o status do pet",
        );

        return;
      }

      await carregarPets();
    } catch {
      setErro("Não foi possível conectar com a API");
    }
  }

  if (carregando) {
    return <p>Carregando pets...</p>;
  }

  return (
    <main>
      <h1>Pets</h1>

      <p>
        <Link to="/dashboard">
          Voltar para o dashboard
        </Link>
      </p>

      <p>
        <Link to="/pets/novo">
          Cadastrar novo pet
        </Link>
      </p>

      {erro && <p>{erro}</p>}

      {!erro && pets.length === 0 && (
        <p>Nenhum pet cadastrado.</p>
      )}

      {pets.map((pet) => (
        <article key={pet.id}>
          <h2>{pet.nome}</h2>

          <p>Espécie: {pet.especie}</p>

          {pet.raca && <p>Raça: {pet.raca}</p>}

          <p>
            Status: {pet.ativo ? "Ativo" : "Inativo"}
          </p>

          <p>
            <Link to={`/pets/${pet.id}/editar`}>
              Editar
            </Link>
          </p>

          <button
            type="button"
            onClick={() => alterarStatus(pet)}
          >
            {pet.ativo ? "Inativar" : "Ativar"}
          </button>
        </article>
      ))}
    </main>
  );
}