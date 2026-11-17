import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router";

import Sidebar from "../components/Sidebar";

import "./DashboardPage.css";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  clienteId?: number | null;
};

type AuthResponse = {
  usuario: Usuario;
};

type Pet = {
  id: number;
  nome: string;
  especie: string;
  raca?: string | null;
  ativo: boolean;
};

type Servico = {
  id: number;
  nome: string;
  duracao: number;
};

type Profissional = {
  id: number;
  nome: string;
};

type Agendamento = {
  id: number;
  dataHora: string;
  status: string;

  pet: Pet;
  servico: Servico;
  profissional: Profissional;
};

type ApiError = {
  message?: string;
};

async function obterMensagemErro(
  response: Response,
  fallback: string,
) {
  try {
    const body =
      (await response.json()) as ApiError;

    return body.message || fallback;
  } catch {
    return fallback;
  }
}

function obterIniciais(
  nome?: string | null,
) {
  const nomeLimpo =
    nome?.trim();

  if (!nomeLimpo) {
    return "AP";
  }

  const partes =
    nomeLimpo
      .split(/\s+/)
      .filter(Boolean);

  if (partes.length === 1) {
    return partes[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    partes[0][0] +
    partes[
      partes.length - 1
    ][0]
  ).toUpperCase();
}

function formatarDia(
  dataHora: string,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
    },
  ).format(
    new Date(dataHora),
  );
}

function formatarMes(
  dataHora: string,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "short",
    },
  )
    .format(
      new Date(dataHora),
    )
    .replace(".", "")
    .toUpperCase();
}

function formatarHorario(
  dataHora: string,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(dataHora),
  );
}

export default function DashboardPage() {
  const navigate =
    useNavigate();

  const [
    usuario,
    setUsuario,
  ] = useState<Usuario | null>(
    null,
  );

  const [pets, setPets] =
    useState<Pet[]>([]);

  const [
    agendamentos,
    setAgendamentos,
  ] = useState<
    Agendamento[]
  >([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    async function carregarDashboard() {
      setCarregando(true);
      setErro("");

      try {
        const [
          usuarioResponse,
          petsResponse,
          agendamentosResponse,
        ] = await Promise.all([
          fetch(
            "/api/auth/me",
            {
              credentials:
                "include",
            },
          ),

          fetch(
            "/api/pets",
            {
              credentials:
                "include",
            },
          ),

          fetch(
            "/api/agendamentos",
            {
              credentials:
                "include",
            },
          ),
        ]);

        if (
          !usuarioResponse.ok
        ) {
          if (
            usuarioResponse.status ===
            401
          ) {
            navigate(
              "/login",
            );

            return;
          }

          throw new Error(
            await obterMensagemErro(
              usuarioResponse,
              "Não foi possível carregar o usuário",
            ),
          );
        }

        if (
          !petsResponse.ok
        ) {
          throw new Error(
            await obterMensagemErro(
              petsResponse,
              "Não foi possível carregar os pets",
            ),
          );
        }

        if (
          !agendamentosResponse.ok
        ) {
          throw new Error(
            await obterMensagemErro(
              agendamentosResponse,
              "Não foi possível carregar os agendamentos",
            ),
          );
        }

        const authData =
          (await usuarioResponse.json()) as AuthResponse;

        const petsData =
          (await petsResponse.json()) as Pet[];

        const agendamentosData =
          (await agendamentosResponse.json()) as Agendamento[];

        setUsuario(
          authData.usuario,
        );

        setPets(
          petsData,
        );

        setAgendamentos(
          agendamentosData,
        );
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setErro(
            error.message,
          );
        } else {
          setErro(
            "Não foi possível carregar o dashboard",
          );
        }
      } finally {
        setCarregando(false);
      }
    }

    void carregarDashboard();
  }, [navigate]);

  const petsAtivos =
    pets.filter(
      (pet) => pet.ativo,
    );

  const agendamentosAtivos =
    agendamentos.filter(
      (agendamento) =>
        agendamento.status ===
        "AGENDADO",
    );

  const agora =
    new Date();

  const proximoAgendamento =
    agendamentosAtivos
      .filter(
        (agendamento) =>
          new Date(
            agendamento.dataHora,
          ).getTime() >
          agora.getTime(),
      )
      .sort(
        (a, b) =>
          new Date(
            a.dataHora,
          ).getTime() -
          new Date(
            b.dataHora,
          ).getTime(),
      )[0] ?? null;

  if (carregando) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="empty-state">
            <h3>
              Carregando...
            </h3>

            <p>
              Buscando as
              informações do
              dashboard.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              Visão geral
            </span>

            <h1>
              Olá,{" "}
              {usuario?.nome
                ?.split(" ")[0] ||
                "Cliente"}
              .
            </h1>

            <p>
              Acompanhe seus pets
              e próximos
              agendamentos.
            </p>
          </div>

          {usuario && (
            <div className="dashboard-user">
              <div className="user-info">
                <strong>
                  {
                    usuario.nome
                  }
                </strong>

                <span>
                  {
                    usuario.email
                  }
                </span>
              </div>

              <div className="user-avatar">
                {obterIniciais(
                  usuario.nome,
                )}
              </div>
            </div>
          )}
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
                Agende o próximo
                serviço do seu pet
              </h2>

              <p>
                Escolha seu pet,
                serviço,
                profissional,
                data e horário.
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

        <div className="dashboard-stats">
          <Link
            to="/pets"
            className="stat-card"
          >
            <div className="stat-card-top">
              <span className="stat-label">
                Pets ativos
              </span>

              <div className="stat-icon">
                P
              </div>
            </div>

            <strong className="stat-value">
              {
                petsAtivos.length
              }
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

              <div className="stat-icon">
                A
              </div>
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
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
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
                    {formatarDia(
                      proximoAgendamento.dataHora,
                    )}
                  </strong>

                  <span>
                    {formatarMes(
                      proximoAgendamento.dataHora,
                    )}
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
                      {formatarHorario(
                        proximoAgendamento.dataHora,
                      )}
                    </span>

                    <span>
                      {
                        proximoAgendamento
                          .profissional.nome
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
                  Nenhum
                  agendamento
                  futuro
                </h3>

                <p>
                  Quando precisar,
                  você pode criar
                  um novo
                  agendamento.
                </p>

                <Link
                  to="/agendamentos/novo"
                  className="primary-button"
                >
                  Novo agendamento
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}