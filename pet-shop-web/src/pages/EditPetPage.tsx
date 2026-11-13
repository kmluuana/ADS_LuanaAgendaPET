import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import "./DashboardPage.css";
import "./PetFormPage.css";

type Pet = {
  id: number;
  nome: string;
  especie: string;
  raca?: string | null;
  dataNascimento?: string | null;
  observacoes?: string | null;
  ativo: boolean;
};

export default function EditPetPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [nome, setNome] =
    useState("");

  const [especie, setEspecie] =
    useState("");

  const [raca, setRaca] =
    useState("");

  const [
    dataNascimento,
    setDataNascimento,
  ] = useState("");

  const [
    observacoes,
    setObservacoes,
  ] = useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    async function carregarPet() {
      try {
        const response = await fetch(
          `/api/pets/${id}`,
          {
            credentials: "include",
          },
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ??
              "Não foi possível carregar o pet",
          );
        }

        const pet: Pet = data;

        setNome(pet.nome);
        setEspecie(pet.especie);
        setRaca(pet.raca ?? "");

        setObservacoes(
          pet.observacoes ?? "",
        );

        if (pet.dataNascimento) {
          const data =
            new Date(
              pet.dataNascimento,
            );

          setDataNascimento(
            data
              .toISOString()
              .slice(0, 10),
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          setErro(error.message);
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarPet();
  }, [id]);

  async function atualizarPet(
    event: FormEvent,
  ) {
    event.preventDefault();

    setErro("");
    setSalvando(true);

    try {
      const response = await fetch(
        `/api/pets/${id}`,
        {
          method: "PUT",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            nome: nome.trim(),
            especie:
              especie.trim(),

            raca:
              raca.trim() ||
              undefined,

            dataNascimento:
              dataNascimento ||
              undefined,

            observacoes:
              observacoes.trim() ||
              undefined,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        setErro(
          data.message ??
            "Não foi possível atualizar o pet",
        );

        return;
      }

      navigate("/pets", {
        replace: true,
      });
    } catch {
      setErro(
        "Não foi possível conectar com a API",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        },
      );
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  }

  if (carregando) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />

        <span>
          Carregando pet...
        </span>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              AP
            </div>

            <div>
              <strong>
                Agenda Pet
              </strong>

              <span>
                Gestão simples
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link
              to="/dashboard"
              className="sidebar-link"
            >
              <span className="nav-icon">
                D
              </span>

              Dashboard
            </Link>

            <Link
              to="/pets"
              className="sidebar-link active"
            >
              <span className="nav-icon">
                P
              </span>

              Meus Pets
            </Link>

            <Link
              to="/agendamentos"
              className="sidebar-link"
            >
              <span className="nav-icon">
                A
              </span>

              Agendamentos
            </Link>
          </nav>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={sair}
        >
          Sair
        </button>
      </aside>

      <main className="pet-form-page">
        <div className="pet-form-header">
          <div>
            <span className="dashboard-eyebrow">
              Meus Pets
            </span>

            <h1>
              Editar pet
            </h1>

            <p>
              Atualize as informações
              do seu companheiro.
            </p>
          </div>

          <Link
            to="/pets"
            className="pet-form-back"
          >
            ← Voltar
          </Link>
        </div>

        <div className="pet-form-layout">
          <section className="pet-form-card">
            <div className="pet-form-card-header">
              <div className="pet-form-icon">
                P
              </div>

              <div>
                <h2>
                  Dados do pet
                </h2>

                <p>
                  Altere apenas o que
                  for necessário.
                </p>
              </div>
            </div>

            {erro && (
              <div className="dashboard-error">
                {erro}
              </div>
            )}

            <form
              className="pet-form"
              onSubmit={atualizarPet}
            >
              <div className="form-field form-field-full">
                <label htmlFor="nome">
                  Nome
                </label>

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) =>
                    setNome(
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="especie">
                    Espécie
                  </label>

                  <select
                    id="especie"
                    value={especie}
                    onChange={(event) =>
                      setEspecie(
                        event.target.value,
                      )
                    }
                    required
                  >
                    <option value="">
                      Selecione
                    </option>

                    <option value="Cachorro">
                      Cachorro
                    </option>

                    <option value="Gato">
                      Gato
                    </option>

                    <option value="Outro">
                      Outro
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="raca">
                    Raça
                  </label>

                  <input
                    id="raca"
                    type="text"
                    value={raca}
                    onChange={(event) =>
                      setRaca(
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="dataNascimento">
                  Data de nascimento
                </label>

                <input
                  id="dataNascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(event) =>
                    setDataNascimento(
                      event.target.value,
                    )
                  }
                />

                <span className="form-help">
                  Campo opcional.
                </span>
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="observacoes">
                  Observações
                </label>

                <textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(event) =>
                    setObservacoes(
                      event.target.value,
                    )
                  }
                  placeholder="Alguma informação importante sobre o pet?"
                  rows={5}
                />
              </div>

              <div className="pet-form-actions">
                <Link
                  to="/pets"
                  className="form-secondary-button"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  className="form-primary-button"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
          </section>

          <aside className="pet-form-info">
            <div className="pet-form-info-badge">
              P
            </div>

            <h2>
              Mantenha os dados atualizados
            </h2>

            <p>
              Essas informações são usadas
              para identificar seu pet nos
              próximos agendamentos.
            </p>

            <div className="pet-form-info-item">
              <strong>
                Nome
              </strong>

              <span>
                Use o nome pelo qual o pet
                é normalmente identificado.
              </span>
            </div>

            <div className="pet-form-info-item">
              <strong>
                Espécie e raça
              </strong>

              <span>
                Facilitam a identificação
                durante o atendimento.
              </span>
            </div>

            <div className="pet-form-info-item">
              <strong>
                Observações
              </strong>

              <span>
                Podem registrar detalhes
                relevantes sobre o animal.
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}