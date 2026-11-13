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

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil:
    | "CLIENTE"
    | "ATENDENTE"
    | "ADMINISTRADOR";
  clienteId: number | null;
};

type Pet = {
  id: number;
  nome: string;
  especie: string;
  ativo: boolean;
};

type Agendamento = {
  id: number;
  dataHora: string;
  status:
    | "AGENDADO"
    | "CONCLUIDO"
    | "CANCELADO";

  pet: {
    nome: string;
  };

  servico: {
    nome: string;
  };

  profissional: {
    nome: string;
  };
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [pets, setPets] =
    useState<Pet[]>([]);

  const [
    agendamentos,
    setAgendamentos,
  ] = useState<Agendamento[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [
          usuarioResponse,
          petsResponse,
          agendamentosResponse,
        ] = await Promise.all([
          fetch("/api/auth/me", {
            credentials: "include",
          }),

          fetch("/api/pets", {
            credentials: "include",
          }),

          fetch("/api/agendamentos", {
            credentials: "include",
          }),
        ]);

        if (!usuarioResponse.ok) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (
          !petsResponse.ok ||
          !agendamentosResponse.ok
        ) {
          throw new Error(
            "Não foi possível carregar o dashboard",
          );
        }

        const usuarioData =
          await usuarioResponse.json();

        const petsData =
          await petsResponse.json();

        const agendamentosData =
          await agendamentosResponse.json();

        setUsuario(usuarioData.usuario);
        setPets(petsData);
        setAgendamentos(
          agendamentosData,
        );
      } catch (error) {
        if (error instanceof Error) {
          setErro(error.message);
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, [navigate]);

  const petsAtivos = useMemo(
    () =>
      pets.filter(
        (pet) => pet.ativo,
      ).length,
    [pets],
  );

  const agendamentosAtivos =
    useMemo(
      () =>
        agendamentos.filter(
          (agendamento) =>
            agendamento.status ===
            "AGENDADO",
        ),
      [agendamentos],
    );

  const proximoAgendamento =
    useMemo(() => {
      const agora = new Date();

      return [...agendamentosAtivos]
        .filter(
          (agendamento) =>
            new Date(
              agendamento.dataHora,
            ) >= agora,
        )
        .sort(
          (a, b) =>
            new Date(
              a.dataHora,
            ).getTime() -
            new Date(
              b.dataHora,
            ).getTime(),
        )[0];
    }, [agendamentosAtivos]);

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

  function obterPrimeiroNome() {
    if (!usuario?.nome) {
      return "";
    }

    return usuario.nome
      .trim()
      .split(" ")[0];
  }

  function obterIniciais() {
    if (!usuario?.nome) {
      return "AP";
    }

    const partes =
      usuario.nome
        .trim()
        .split(" ")
        .filter(Boolean);

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      partes[0][0] +
      partes[
        partes.length - 1
      ][0]
    ).toUpperCase();
  }

  if (carregando) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />

        <span>
          Carregando dashboard...
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
              className="sidebar-link active"
            >
              <span className="nav-icon">
                D
              </span>

              Dashboard
            </Link>

            <Link
              to="/pets"
              className="sidebar-link"
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
          className="sidebar-logout"
          type="button"
          onClick={sair}
        >
          Sair
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              Visão geral
            </span>

            <h1>
              Olá,{" "}
              {obterPrimeiroNome()}.
            </h1>

            <p>
              Acompanhe seus pets e
              próximos agendamentos.
            </p>
          </div>

          <div className="dashboard-user">
            <div className="user-info">
              <strong>
                {usuario?.nome}
              </strong>

              <span>
                {usuario?.email}
              </span>
            </div>

            <div className="user-avatar">
              {obterIniciais()}
            </div>
          </div>
        </header>

        {erro && (
          <div className="dashboard-error">
            {erro}
          </div>
        )}

        <Link
          to="/agendamentos/novo"
          className="schedule-hero"
        >
          <div className="schedule-hero-main">
            <div className="schedule-hero-icon">
              +
            </div>

            <div>
              <span className="schedule-hero-eyebrow">
                Novo agendamento
              </span>

              <h2>
                Agende o próximo serviço do seu pet
              </h2>

              <p>
                Escolha seu pet, serviço,
                profissional, data e horário.
              </p>
            </div>
          </div>

          <div className="schedule-hero-action">
            <span>
              Agendar agora
            </span>

            <strong>
              →
            </strong>
          </div>
        </Link>

        <section className="dashboard-stats">
          <Link
            to="/pets"
            className="stat-card"
          >
            <div className="stat-card-top">
              <span className="stat-label">
                Pets ativos
              </span>

              <span className="stat-icon">
                P
              </span>
            </div>

            <strong className="stat-value">
              {petsAtivos}
            </strong>

            <span className="stat-footer">
              Ver meus pets
            </span>
          </Link>

          <Link
            to="/agendamentos"
            className="stat-card"
          >
            <div className="stat-card-top">
              <span className="stat-label">
                Agendamentos
              </span>

              <span className="stat-icon">
                A
              </span>
            </div>

            <strong className="stat-value">
              {
                agendamentosAtivos.length
              }
            </strong>

            <span className="stat-footer">
              Agendamentos ativos
            </span>
          </Link>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">
                  Agenda
                </span>

                <h2>
                  Próximo agendamento
                </h2>
              </div>

              <Link
                to="/agendamentos"
                className="panel-link"
              >
                Ver todos
              </Link>
            </div>

            {proximoAgendamento ? (
              <div className="appointment-card">
                <div className="appointment-date">
                  <strong>
                    {new Date(
                      proximoAgendamento.dataHora,
                    ).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                      },
                    )}
                  </strong>

                  <span>
                    {new Date(
                      proximoAgendamento.dataHora,
                    )
                      .toLocaleDateString(
                        "pt-BR",
                        {
                          month: "short",
                        },
                      )
                      .replace(".", "")}
                  </span>
                </div>

                <div className="appointment-info">
                  <div className="appointment-title">
                    <div>
                      <h3>
                        {
                          proximoAgendamento
                            .pet.nome
                        }
                      </h3>

                      <p>
                        {
                          proximoAgendamento
                            .servico.nome
                        }
                      </p>
                    </div>

                    <span className="status-badge">
                      Agendado
                    </span>
                  </div>

                  <div className="appointment-details">
                    <span>
                      {new Date(
                        proximoAgendamento.dataHora,
                      ).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>

                    <span>
                      {
                        proximoAgendamento
                          .profissional
                          .nome
                      }
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  +
                </div>

                <h3>
                  Nenhum agendamento futuro
                </h3>

                <p>
                  Quando precisar,
                  você pode criar um
                  novo agendamento.
                </p>

                <Link
                  to="/agendamentos/novo"
                  className="primary-button"
                >
                  Novo agendamento
                </Link>
              </div>
            )}
          </article>

          <article className="dashboard-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">
                  Pets
                </span>

                <h2>
                  Seus companheiros
                </h2>
              </div>

              <Link
                to="/pets"
                className="panel-link"
              >
                Ver todos
              </Link>
            </div>

            <div className="pets-preview">
              {pets
                .filter(
                  (pet) => pet.ativo,
                )
                .slice(0, 3)
                .map((pet) => (
                  <div
                    className="pet-preview"
                    key={pet.id}
                  >
                    <div className="pet-avatar">
                      {pet.nome
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {pet.nome}
                      </strong>

                      <span>
                        {pet.especie}
                      </span>
                    </div>
                  </div>
                ))}

              {petsAtivos === 0 && (
                <div className="empty-small">
                  <p>
                    Nenhum pet cadastrado.
                  </p>

                  <Link to="/pets/novo">
                    Cadastrar pet
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/pets/novo"
              className="secondary-button"
            >
              + Cadastrar novo pet
            </Link>
          </article>
        </section>
      </main>
    </div>
  );
}