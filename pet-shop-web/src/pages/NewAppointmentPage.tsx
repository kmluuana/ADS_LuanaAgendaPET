import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";

import "./DashboardPage.css";
import "./AppointmentFormPage.css";

type Pet = {
  id: number;
  nome: string;
  ativo: boolean;
};

type Servico = {
  id: number;
  nome: string;
  duracao: number;
  ativo: boolean;
};

type Profissional = {
  id: number;
  nome: string;
  ativo: boolean;
};

function formatarDataHoraLocal(
  data: Date,
) {
  const offset =
    data.getTimezoneOffset() *
    60 *
    1000;

  return new Date(
    data.getTime() - offset,
  )
    .toISOString()
    .slice(0, 16);
}

function obterDataHoraMinima() {
  const agora = new Date();

  agora.setSeconds(0);
  agora.setMilliseconds(0);

  return formatarDataHoraLocal(
    agora,
  );
}

function obterDataHoraMaxima() {
  const limite = new Date();

  limite.setFullYear(
    limite.getFullYear() + 1,
  );

  limite.setSeconds(0);
  limite.setMilliseconds(0);

  return formatarDataHoraLocal(
    limite,
  );
}

export default function NewAppointmentPage() {
  const navigate = useNavigate();

  const [pets, setPets] =
    useState<Pet[]>([]);

  const [servicos, setServicos] =
    useState<Servico[]>([]);

  const [
    profissionais,
    setProfissionais,
  ] = useState<Profissional[]>([]);

  const [petId, setPetId] =
    useState("");

  const [servicoId, setServicoId] =
    useState("");

  const [
    profissionalId,
    setProfissionalId,
  ] = useState("");

  const [dataHora, setDataHora] =
    useState("");

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

  const dataHoraMinima =
    useMemo(
      () => obterDataHoraMinima(),
      [],
    );

  const dataHoraMaxima =
    useMemo(
      () => obterDataHoraMaxima(),
      [],
    );

  useEffect(() => {
    async function carregarDados() {
      try {
        setErro("");

        const [
          petsResponse,
          servicosResponse,
          profissionaisResponse,
        ] = await Promise.all([
          fetch("/api/pets", {
            credentials: "include",
          }),

          fetch("/api/servicos", {
            credentials: "include",
          }),

          fetch("/api/profissionais", {
            credentials: "include",
          }),
        ]);

        if (
          !petsResponse.ok ||
          !servicosResponse.ok ||
          !profissionaisResponse.ok
        ) {
          throw new Error(
            "Não foi possível carregar os dados do agendamento",
          );
        }

        const [
          petsData,
          servicosData,
          profissionaisData,
        ] = await Promise.all([
          petsResponse.json(),
          servicosResponse.json(),
          profissionaisResponse.json(),
        ]);

        const petsAtivos =
          petsData.filter(
            (pet: Pet) => pet.ativo,
          );

        const servicosAtivos =
          servicosData.filter(
            (servico: Servico) =>
              servico.ativo,
          );

        const profissionaisAtivos =
          profissionaisData.filter(
            (
              profissional:
                Profissional,
            ) =>
              profissional.ativo,
          );

        setPets(
          petsAtivos,
        );

        setServicos(
          servicosAtivos,
        );

        setProfissionais(
          profissionaisAtivos,
        );

        if (
          petsAtivos.length === 1
        ) {
          setPetId(
            String(
              petsAtivos[0].id,
            ),
          );
        }

        if (
          servicosAtivos.length === 1
        ) {
          setServicoId(
            String(
              servicosAtivos[0].id,
            ),
          );
        }

        if (
          profissionaisAtivos.length ===
          1
        ) {
          setProfissionalId(
            String(
              profissionaisAtivos[0]
                .id,
            ),
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          setErro(
            error.message,
          );
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  function validarDataNoFrontend() {
    if (!dataHora) {
      throw new Error(
        "Selecione a data e o horário",
      );
    }

    const dataSelecionada =
      new Date(dataHora);

    const agora =
      new Date();

    const limiteMaximo =
      new Date();

    limiteMaximo.setFullYear(
      limiteMaximo.getFullYear() +
        1,
    );

    if (
      Number.isNaN(
        dataSelecionada.getTime(),
      )
    ) {
      throw new Error(
        "Data e horário inválidos",
      );
    }

    if (
      dataSelecionada.getTime() <=
      agora.getTime()
    ) {
      throw new Error(
        "Escolha uma data e horário futuros",
      );
    }

    if (
      dataSelecionada.getTime() >
      limiteMaximo.getTime()
    ) {
      throw new Error(
        "O agendamento pode ser realizado com no máximo 1 ano de antecedência",
      );
    }
  }

  async function cadastrarAgendamento(
    event: FormEvent,
  ) {
    event.preventDefault();

    setErro("");

    try {
      validarDataNoFrontend();

      setSalvando(true);

      const response = await fetch(
        "/api/agendamentos",
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            petId: Number(petId),

            servicoId:
              Number(servicoId),

            profissionalId:
              Number(profissionalId),

            dataHora: new Date(
              dataHora,
            ).toISOString(),

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
            "Não foi possível realizar o agendamento",
        );

        return;
      }

      navigate(
        "/agendamentos",
        {
          replace: true,
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        setErro(
          error.message,
        );
      } else {
        setErro(
          "Não foi possível conectar com a API",
        );
      }
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
      navigate(
        "/login",
        {
          replace: true,
        },
      );
    }
  }

  if (carregando) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />

        <span>
          Carregando dados...
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

      <main className="appointment-form-page">
        <header className="appointment-form-header">
          <div>
            <span className="dashboard-eyebrow">
              Agenda
            </span>

            <h1>
              Novo agendamento
            </h1>

            <p>
              Escolha o pet, serviço,
              profissional e horário.
            </p>
          </div>

          <Link
            to="/agendamentos"
            className="appointment-form-back"
          >
            ← Voltar
          </Link>
        </header>

        {erro && (
          <div className="dashboard-error">
            {erro}
          </div>
        )}

        <div className="appointment-form-layout">
          <section className="appointment-form-card">
            <div className="appointment-form-card-header">
              <div className="appointment-form-icon">
                +
              </div>

              <div>
                <h2>
                  Dados do agendamento
                </h2>

                <p>
                  Preencha as informações
                  para reservar o atendimento.
                </p>
              </div>
            </div>

            {pets.length === 0 ? (
              <div className="appointment-form-empty">
                <h3>
                  Nenhum pet disponível
                </h3>

                <p>
                  Você precisa cadastrar
                  um pet ativo antes de
                  realizar um agendamento.
                </p>

                <Link
                  to="/pets/novo"
                  className="form-primary-button"
                >
                  Cadastrar pet
                </Link>
              </div>
            ) : (
              <form
                className="appointment-form"
                onSubmit={
                  cadastrarAgendamento
                }
              >
                <div className="appointment-form-section">
                  <div className="appointment-section-number">
                    1
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Quem será atendido?
                    </h3>

                    <div className="form-field">
                      <label htmlFor="pet">
                        Pet
                      </label>

                      <select
                        id="pet"
                        value={petId}
                        onChange={(event) =>
                          setPetId(
                            event.target.value,
                          )
                        }
                        required
                      >
                        <option value="">
                          Selecione um pet
                        </option>

                        {pets.map(
                          (pet) => (
                            <option
                              key={pet.id}
                              value={pet.id}
                            >
                              {pet.nome}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="appointment-form-divider" />

                <div className="appointment-form-section">
                  <div className="appointment-section-number">
                    2
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Qual serviço?
                    </h3>

                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="servico">
                          Serviço
                        </label>

                        <select
                          id="servico"
                          value={servicoId}
                          onChange={(event) =>
                            setServicoId(
                              event.target
                                .value,
                            )
                          }
                          required
                        >
                          <option value="">
                            Selecione
                          </option>

                          {servicos.map(
                            (servico) => (
                              <option
                                key={
                                  servico.id
                                }
                                value={
                                  servico.id
                                }
                              >
                                {
                                  servico.nome
                                }{" "}
                                -{" "}
                                {
                                  servico.duracao
                                }{" "}
                                min
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div className="form-field">
                        <label htmlFor="profissional">
                          Profissional
                        </label>

                        <select
                          id="profissional"
                          value={
                            profissionalId
                          }
                          onChange={(event) =>
                            setProfissionalId(
                              event.target
                                .value,
                            )
                          }
                          required
                        >
                          <option value="">
                            Selecione
                          </option>

                          {profissionais.map(
                            (profissional) => (
                              <option
                                key={
                                  profissional.id
                                }
                                value={
                                  profissional.id
                                }
                              >
                                {
                                  profissional.nome
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="appointment-form-divider" />

                <div className="appointment-form-section">
                  <div className="appointment-section-number">
                    3
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Quando?
                    </h3>

                    <div className="form-field">
                      <label htmlFor="dataHora">
                        Data e horário
                      </label>

                      <input
                        id="dataHora"
                        type="datetime-local"

                        min={
                          dataHoraMinima
                        }

                        max={
                          dataHoraMaxima
                        }

                        value={dataHora}

                        onChange={(event) =>
                          setDataHora(
                            event.target
                              .value,
                          )
                        }

                        required
                      />

                      <span className="form-help">
                        Entre agora e
                        no máximo 1 ano
                        no futuro.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="appointment-form-divider" />

                <div className="appointment-form-section">
                  <div className="appointment-section-number">
                    4
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Alguma observação?
                    </h3>

                    <div className="form-field">
                      <label htmlFor="observacoes">
                        Observações
                      </label>

                      <textarea
                        id="observacoes"

                        value={
                          observacoes
                        }

                        onChange={(event) =>
                          setObservacoes(
                            event.target
                              .value,
                          )
                        }

                        placeholder="Ex.: informações importantes sobre o atendimento"

                        rows={4}
                      />

                      <span className="form-help">
                        Campo opcional.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="appointment-form-actions">
                  <Link
                    to="/agendamentos"
                    className="form-secondary-button"
                  >
                    Cancelar
                  </Link>

                  <button
                    type="submit"
                    className="form-primary-button"
                    disabled={
                      salvando
                    }
                  >
                    {salvando
                      ? "Agendando..."
                      : "Confirmar agendamento"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside className="appointment-form-info">
            <span className="appointment-info-label">
              Novo agendamento
            </span>

            <h2>
              Simples e rápido
            </h2>

            <p>
              Escolha as informações
              do atendimento e confirme
              o horário.
            </p>

            <div className="appointment-info-step">
              <span>
                01
              </span>

              <div>
                <strong>
                  Escolha o pet
                </strong>

                <p>
                  Apenas seus pets ativos
                  ficam disponíveis.
                </p>
              </div>
            </div>

            <div className="appointment-info-step">
              <span>
                02
              </span>

              <div>
                <strong>
                  Serviço e profissional
                </strong>

                <p>
                  O profissional precisa
                  realizar o serviço
                  selecionado.
                </p>
              </div>
            </div>

            <div className="appointment-info-step">
              <span>
                03
              </span>

              <div>
                <strong>
                  Data e horário
                </strong>

                <p>
                  O sistema verifica
                  conflitos antes de
                  confirmar.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}