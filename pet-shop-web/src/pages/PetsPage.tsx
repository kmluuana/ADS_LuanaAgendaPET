import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";

import "./DashboardPage.css";
import "./PetsPage.css";

type Pet = {
  id: number;
  nome: string;
  especie: string;
  raca?: string | null;
  ativo: boolean;
};

type FiltroPet =
  | "TODOS"
  | "ATIVOS"
  | "INATIVOS";

export default function PetsPage() {
  const navigate = useNavigate();

  const [pets, setPets] =
    useState<Pet[]>([]);

  const [filtro, setFiltro] =
    useState<FiltroPet>("TODOS");

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  async function carregarPets() {
    try {
      const response = await fetch(
        "/api/pets",
        {
          credentials: "include",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Não foi possível carregar os pets",
        );
      }

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

  const petsFiltrados = useMemo(
    () =>
      pets.filter((pet) => {
        if (filtro === "ATIVOS") {
          return pet.ativo;
        }

        if (filtro === "INATIVOS") {
          return !pet.ativo;
        }

        return true;
      }),
    [pets, filtro],
  );

  const quantidadeAtivos =
    useMemo(
      () =>
        pets.filter(
          (pet) => pet.ativo,
        ).length,
      [pets],
    );

  async function alterarStatus(
    pet: Pet,
  ) {
    const acao =
      pet.ativo
        ? "inativar"
        : "ativar";

    const confirmar =
      window.confirm(
        `Deseja realmente ${acao} ${pet.nome}?`,
      );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `/api/pets/${pet.id}/ativo`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ativo: !pet.ativo,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        setErro(
          data.message ??
            "Não foi possível alterar o status do pet",
        );

        return;
      }

      await carregarPets();
    } catch {
      setErro(
        "Não foi possível conectar com a API",
      );
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

  function obterInicial(
    nome: string,
  ) {
    return nome
      .charAt(0)
      .toUpperCase();
  }

  if (carregando) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />

        <span>
          Carregando pets...
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

      <main className="pets-page">
        <header className="pets-header">
          <div>
            <span className="dashboard-eyebrow">
              Seus companheiros
            </span>

            <h1>Meus Pets</h1>

            <p>
              Gerencie os pets vinculados
              à sua conta.
            </p>
          </div>

          <Link
            to="/pets/novo"
            className="pets-primary-button"
          >
            <span>+</span>
            Novo pet
          </Link>
        </header>

        {erro && (
          <div className="dashboard-error">
            {erro}
          </div>
        )}

        <section className="pets-summary">
          <div className="pets-summary-card">
            <span>
              Total de pets
            </span>

            <strong>
              {pets.length}
            </strong>
          </div>

          <div className="pets-summary-card">
            <span>
              Pets ativos
            </span>

            <strong>
              {quantidadeAtivos}
            </strong>
          </div>

          <div className="pets-summary-card">
            <span>
              Pets inativos
            </span>

            <strong>
              {pets.length -
                quantidadeAtivos}
            </strong>
          </div>
        </section>

        <section className="pets-content">
          <div className="pets-toolbar">
            <div>
              <h2>
                Lista de pets
              </h2>

              <p>
                Visualize e gerencie
                seus animais cadastrados.
              </p>
            </div>

            <div className="pets-filters">
              <button
                type="button"
                className={
                  filtro === "TODOS"
                    ? "pet-filter active"
                    : "pet-filter"
                }
                onClick={() =>
                  setFiltro("TODOS")
                }
              >
                Todos
              </button>

              <button
                type="button"
                className={
                  filtro === "ATIVOS"
                    ? "pet-filter active"
                    : "pet-filter"
                }
                onClick={() =>
                  setFiltro("ATIVOS")
                }
              >
                Ativos
              </button>

              <button
                type="button"
                className={
                  filtro ===
                  "INATIVOS"
                    ? "pet-filter active"
                    : "pet-filter"
                }
                onClick={() =>
                  setFiltro(
                    "INATIVOS",
                  )
                }
              >
                Inativos
              </button>
            </div>
          </div>

          {petsFiltrados.length ===
          0 ? (
            <div className="pets-empty">
              <div className="pets-empty-icon">
                P
              </div>

              <h3>
                Nenhum pet encontrado
              </h3>

              <p>
                Você ainda não possui
                pets neste filtro.
              </p>

              <Link
                to="/pets/novo"
                className="pets-primary-button"
              >
                Cadastrar pet
              </Link>
            </div>
          ) : (
            <div className="pets-grid">
              {petsFiltrados.map(
                (pet) => (
                  <article
                    key={pet.id}
                    className="pet-card"
                  >
                    <div className="pet-card-top">
                      <div className="pet-card-avatar">
                        {obterInicial(
                          pet.nome,
                        )}
                      </div>

                      <span
                        className={
                          pet.ativo
                            ? "pet-status active"
                            : "pet-status inactive"
                        }
                      >
                        {pet.ativo
                          ? "Ativo"
                          : "Inativo"}
                      </span>
                    </div>

                    <div className="pet-card-content">
                      <h3>
                        {pet.nome}
                      </h3>

                      <div className="pet-card-info">
                        <div>
                          <span>
                            Espécie
                          </span>

                          <strong>
                            {
                              pet.especie
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Raça
                          </span>

                          <strong>
                            {pet.raca ||
                              "Não informada"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="pet-card-actions">
                      <Link
                        to={`/pets/${pet.id}/editar`}
                        className="pet-edit-button"
                      >
                        Editar
                      </Link>

                      <button
                        type="button"
                        className={
                          pet.ativo
                            ? "pet-status-button danger"
                            : "pet-status-button success"
                        }
                        onClick={() =>
                          alterarStatus(
                            pet,
                          )
                        }
                      >
                        {pet.ativo
                          ? "Inativar"
                          : "Ativar"}
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}