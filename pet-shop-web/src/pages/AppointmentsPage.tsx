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
import "./AppointmentsPage.css";

type StatusAgendamento =
  | "AGENDADO"
  | "CONCLUIDO"
  | "CANCELADO";

type FiltroAgendamento =
  | "TODOS"
  | StatusAgendamento;

type Appointment = {
  id: number;
  dataHora: string;
  status: StatusAgendamento;
  observacoes?: string | null;

  pet: {
    id: number;
    nome: string;
  };

  servico: {
    id: number;
    nome: string;
    duracao: number;
  };

  profissional: {
    id: number;
    nome: string;
  };
};

export default function AppointmentsPage() {
  const navigate = useNavigate();

  const [
    agendamentos,
    setAgendamentos,
  ] = useState<Appointment[]>([]);

  const [filtro, setFiltro] =
    useState<FiltroAgendamento>(
      "TODOS",
    );

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  async function carregarAgendamentos() {
    try {
      const response = await fetch(
        "/api/agendamentos",
        {
          credentials: "include",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Não foi possível carregar os agendamentos",
        );
      }

      setAgendamentos(data);
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
    carregarAgendamentos();
  }, []);

  const agendamentosFiltrados =
    useMemo(
      () =>
        agendamentos.filter(
          (agendamento) => {
            if (filtro === "TODOS") {
              return true;
            }

            return (
              agendamento.status ===
              filtro
            );
          },
        ),
      [agendamentos, filtro],
    );

  const totalAgendados =
    useMemo(
      () =>
        agendamentos.filter(
          (agendamento) =>
            agendamento.status ===
            "AGENDADO",
        ).length,
      [agendamentos],
    );

  const totalConcluidos =
    useMemo(
      () =>
        agendamentos.filter(
          (agendamento) =>
            agendamento.status ===
            "CONCLUIDO",
        ).length,
      [agendamentos],
    );

  const totalCancelados =
    useMemo(
      () =>
        agendamentos.filter(
          (agendamento) =>
            agendamento.status ===
            "CANCELADO",
        ).length,
      [agendamentos],
    );

  async function cancelarAgendamento(
    id: number,
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente cancelar este agendamento?",
      );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `/api/agendamentos/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: "CANCELADO",
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        setErro(
          data.message ??
            "Não foi possível cancelar o agendamento",
        );

        return;
      }

      await carregarAgendamentos();
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

  function formatarData(
    dataHora: string,
  ) {
    return new Date(
      dataHora,
    ).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }

  function formatarHorario(
    dataHora: string,
  ) {
    return new Date(
      dataHora,
    ).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  function obterClasseStatus(
    status: StatusAgendamento,
  ) {
    if (status === "AGENDADO") {
      return "appointment-status scheduled";
    }

    if (status === "CONCLUIDO") {
      return "appointment-status completed";
    }

    return "appointment-status cancelled";
  }

  function obterTextoStatus(
    status: StatusAgendamento,
  ) {
    if (status === "AGENDADO") {
      return "Agendado";
    }

    if (status === "CONCLUIDO") {
      return "Concluído";
    }

    return "Cancelado";
  }

  if (carregando) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />

        <span>
          Carregando agendamentos...
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
              className="sidebar-link"
            >
              <span className="nav-icon">
                P
              </span>

              Meus Pets
            </Link>

            <Link
              to="/agendamentos"
              className="sidebar-link active"
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

      <main className="appointments-page">
        <header className="appointments-header">
          <div>
            <span className="dashboard-eyebrow">
              Agenda
            </span>

            <h1>
              Meus Agendamentos
            </h1>

            <p>
              Acompanhe seus serviços
              agendados, concluídos e
              cancelados.
            </p>
          </div>

          <Link
            to="/agendamentos/novo"
            className="appointments-primary-button"
          >
            <span>+</span>
            Novo agendamento
          </Link>
        </header>

        {erro && (
          <div className="dashboard-error">
            {erro}
          </div>
        )}

        <section className="appointments-summary">
          <div className="appointment-summary-card">
            <span>
              Agendados
            </span>

            <strong>
              {totalAgendados}
            </strong>
          </div>

          <div className="appointment-summary-card">
            <span>
              Concluídos
            </span>

            <strong>
              {totalConcluidos}
            </strong>
          </div>

          <div className="appointment-summary-card">
            <span>
              Cancelados
            </span>

            <strong>
              {totalCancelados}
            </strong>
          </div>
        </section>

        <section className="appointments-content">
          <div className="appointments-toolbar">
            <div>
              <h2>
                Histórico
              </h2>

              <p>
                Visualize todos os seus
                agendamentos.
              </p>
            </div>

            <div className="appointments-filters">
              <button
                type="button"
                className={
                  filtro === "TODOS"
                    ? "appointment-filter active"
                    : "appointment-filter"
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
                  filtro === "AGENDADO"
                    ? "appointment-filter active"
                    : "appointment-filter"
                }
                onClick={() =>
                  setFiltro(
                    "AGENDADO",
                  )
                }
              >
                Agendados
              </button>

              <button
                type="button"
                className={
                  filtro === "CONCLUIDO"
                    ? "appointment-filter active"
                    : "appointment-filter"
                }
                onClick={() =>
                  setFiltro(
                    "CONCLUIDO",
                  )
                }
              >
                Concluídos
              </button>

              <button
                type="button"
                className={
                  filtro === "CANCELADO"
                    ? "appointment-filter active"
                    : "appointment-filter"
                }
                onClick={() =>
                  setFiltro(
                    "CANCELADO",
                  )
                }
              >
                Cancelados
              </button>
            </div>
          </div>

          {agendamentosFiltrados.length ===
          0 ? (
            <div className="appointments-empty">
              <div className="appointments-empty-icon">
                A
              </div>

              <h3>
                Nenhum agendamento encontrado
              </h3>

              <p>
                Não existem agendamentos
                neste filtro.
              </p>

              <Link
                to="/agendamentos/novo"
                className="appointments-primary-button"
              >
                Novo agendamento
              </Link>
            </div>
          ) : (
            <div className="appointments-list">
              {agendamentosFiltrados.map(
                (agendamento) => (
                  <article
                    key={
                      agendamento.id
                    }
                    className="appointment-list-card"
                  >
                    <div className="appointment-list-date">
                      <strong>
                        {new Date(
                          agendamento.dataHora,
                        ).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                          },
                        )}
                      </strong>

                      <span>
                        {new Date(
                          agendamento.dataHora,
                        )
                          .toLocaleDateString(
                            "pt-BR",
                            {
                              month:
                                "short",
                            },
                          )
                          .replace(
                            ".",
                            "",
                          )}
                      </span>
                    </div>

                    <div className="appointment-list-main">
                      <div className="appointment-list-heading">
                        <div>
                          <h3>
                            {
                              agendamento
                                .pet.nome
                            }
                          </h3>

                          <p>
                            {
                              agendamento
                                .servico.nome
                            }
                          </p>
                        </div>

                        <span
                          className={obterClasseStatus(
                            agendamento.status,
                          )}
                        >
                          {obterTextoStatus(
                            agendamento.status,
                          )}
                        </span>
                      </div>

                      <div className="appointment-list-details">
                        <div>
                          <span>
                            Data
                          </span>

                          <strong>
                            {formatarData(
                              agendamento.dataHora,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Horário
                          </span>

                          <strong>
                            {formatarHorario(
                              agendamento.dataHora,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Duração
                          </span>

                          <strong>
                            {
                              agendamento
                                .servico
                                .duracao
                            }{" "}
                            min
                          </strong>
                        </div>

                        <div>
                          <span>
                            Profissional
                          </span>

                          <strong>
                            {
                              agendamento
                                .profissional
                                .nome
                            }
                          </strong>
                        </div>
                      </div>

                      {agendamento.observacoes && (
                        <div className="appointment-observation">
                          <span>
                            Observações
                          </span>

                          <p>
                            {
                              agendamento
                                .observacoes
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="appointment-list-actions">
                      {agendamento.status ===
                        "AGENDADO" && (
                        <button
                          type="button"
                          className="appointment-cancel-button"
                          onClick={() =>
                            cancelarAgendamento(
                              agendamento.id,
                            )
                          }
                        >
                          Cancelar
                        </button>
                      )}
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