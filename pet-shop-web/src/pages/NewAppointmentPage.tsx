import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router";

import "./DashboardPage.css";
import "./AppointmentFormPage.css";

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
  descricao?: string | null;
  preco: string;
  duracao: number;
  ativo: boolean;
};

type Profissional = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
};

type ApiError = {
  message?: string;
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
  return formatarDataHoraLocal(
    new Date(),
  );
}

function obterDataHoraMaxima() {
  const limite = new Date();

  limite.setFullYear(
    limite.getFullYear() + 1,
  );

  return formatarDataHoraLocal(
    limite,
  );
}

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

export default function NewAppointmentPage() {
  const navigate = useNavigate();

  const [pets, setPets] = useState<
    Pet[]
  >([]);

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

  const [
    carregandoProfissionais,
    setCarregandoProfissionais,
  ] = useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const dataHoraMinima =
    useMemo(
      () =>
        obterDataHoraMinima(),
      [],
    );

  const dataHoraMaxima =
    useMemo(
      () =>
        obterDataHoraMaxima(),
      [],
    );

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      setErro("");

      try {
        const [
          petsResponse,
          servicosResponse,
        ] = await Promise.all([
          fetch("/api/pets", {
            credentials: "include",
          }),

          fetch("/api/servicos", {
            credentials: "include",
          }),
        ]);

        if (!petsResponse.ok) {
          throw new Error(
            await obterMensagemErro(
              petsResponse,
              "Não foi possível carregar os pets",
            ),
          );
        }

        if (!servicosResponse.ok) {
          throw new Error(
            await obterMensagemErro(
              servicosResponse,
              "Não foi possível carregar os serviços",
            ),
          );
        }

        const petsData =
          (await petsResponse.json()) as Pet[];

        const servicosData =
          (await servicosResponse.json()) as Servico[];

        const petsAtivos =
          petsData.filter(
            (pet) => pet.ativo,
          );

        const servicosAtivos =
          servicosData.filter(
            (servico) =>
              servico.ativo,
          );

        setPets(
          petsAtivos,
        );

        setServicos(
          servicosAtivos,
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
          servicosAtivos.length ===
          1
        ) {
          setServicoId(
            String(
              servicosAtivos[0].id,
            ),
          );
        }
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setErro(
            error.message,
          );
        } else {
          setErro(
            "Não foi possível carregar os dados do agendamento",
          );
        }
      } finally {
        setCarregando(false);
      }
    }

    void carregarDados();
  }, []);

  useEffect(() => {
    async function carregarProfissionais() {
      setProfissionais([]);
      setProfissionalId("");

      if (!servicoId) {
        return;
      }

      setCarregandoProfissionais(
        true,
      );

      setErro("");

      try {
        const response =
          await fetch(
            `/api/profissionais/por-servico/${servicoId}`,
            {
              credentials:
                "include",
            },
          );

        if (!response.ok) {
          throw new Error(
            await obterMensagemErro(
              response,
              "Não foi possível carregar os profissionais",
            ),
          );
        }

        const data =
          (await response.json()) as Profissional[];

        const ativos =
          data.filter(
            (profissional) =>
              profissional.ativo,
          );

        setProfissionais(
          ativos,
        );

        if (
          ativos.length === 1
        ) {
          setProfissionalId(
            String(
              ativos[0].id,
            ),
          );
        }
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setErro(
            error.message,
          );
        } else {
          setErro(
            "Não foi possível carregar os profissionais",
          );
        }
      } finally {
        setCarregandoProfissionais(
          false,
        );
      }
    }

    void carregarProfissionais();
  }, [servicoId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErro("");

    if (
      !petId ||
      !servicoId ||
      !profissionalId ||
      !dataHora
    ) {
      setErro(
        "Preencha todos os campos obrigatórios",
      );

      return;
    }

    const dataSelecionada =
      new Date(dataHora);

    if (
      Number.isNaN(
        dataSelecionada.getTime(),
      )
    ) {
      setErro(
        "Informe uma data e horário válidos",
      );

      return;
    }

    const agora =
      new Date();

    if (
      dataSelecionada.getTime() <=
      agora.getTime()
    ) {
      setErro(
        "Não é possível agendar para uma data ou horário no passado",
      );

      return;
    }

    const limiteMaximo =
      new Date();

    limiteMaximo.setFullYear(
      limiteMaximo.getFullYear() +
        1,
    );

    if (
      dataSelecionada.getTime() >
      limiteMaximo.getTime()
    ) {
      setErro(
        "O agendamento pode ser realizado com no máximo 1 ano de antecedência",
      );

      return;
    }

    setSalvando(true);

    try {
      const response =
        await fetch(
          "/api/agendamentos",
          {
            method: "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              petId:
                Number(petId),

              servicoId:
                Number(
                  servicoId,
                ),

              profissionalId:
                Number(
                  profissionalId,
                ),

              dataHora:
                dataSelecionada.toISOString(),

              observacoes:
                observacoes.trim()
                  ? observacoes.trim()
                  : undefined,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await obterMensagemErro(
            response,
            "Não foi possível criar o agendamento",
          ),
        );
      }

      navigate(
        "/agendamentos",
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
          "Não foi possível criar o agendamento",
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials:
            "include",
        },
      );
    } finally {
      navigate(
        "/login",
      );
    }
  }

  if (carregando) {
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
          </div>

          <button
            className="sidebar-logout"
            type="button"
            onClick={
              handleLogout
            }
          >
            Sair
          </button>
        </aside>

        <main className="dashboard-main">
          <div className="empty-state">
            <h3>
              Carregando...
            </h3>

            <p>
              Buscando os dados
              necessários para o
              agendamento.
            </p>
          </div>
        </main>
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
            <NavLink
              to="/dashboard"
              className={({
                isActive,
              }) =>
                `sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span className="nav-icon">
                D
              </span>

              Dashboard
            </NavLink>

            <NavLink
              to="/pets"
              className={({
                isActive,
              }) =>
                `sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span className="nav-icon">
                P
              </span>

              Meus Pets
            </NavLink>

            <NavLink
              to="/agendamentos"
              className={() =>
                "sidebar-link active"
              }
            >
              <span className="nav-icon">
                A
              </span>

              Agendamentos
            </NavLink>
          </nav>
        </div>

        <button
          className="sidebar-logout"
          type="button"
          onClick={
            handleLogout
          }
        >
          Sair
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="appointment-page-header">
          <div>
            <span className="dashboard-eyebrow">
              Agenda
            </span>

            <h1>
              Novo agendamento
            </h1>

            <p>
              Escolha o pet,
              serviço,
              profissional e
              horário.
            </p>
          </div>

          <Link
            className="appointment-back-button"
            to="/agendamentos"
          >
            ← Voltar
          </Link>
        </header>

        {erro && (
          <div className="dashboard-error">
            {erro}
          </div>
        )}

        <div className="appointment-form-grid">
          <section className="appointment-form-card">
            <div className="appointment-form-title">
              <div className="appointment-form-icon">
                +
              </div>

              <div>
                <h2>
                  Dados do
                  agendamento
                </h2>

                <p>
                  Preencha as
                  informações para
                  reservar o
                  atendimento.
                </p>
              </div>
            </div>

            {pets.length === 0 ? (
              <div className="empty-state">
                <h3>
                  Nenhum pet
                  disponível
                </h3>

                <p>
                  Você precisa
                  cadastrar um pet
                  ativo antes de
                  realizar um
                  agendamento.
                </p>

                <Link
                  className="primary-button"
                  to="/pets/novo"
                >
                  Cadastrar pet
                </Link>
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
              >
                <div className="appointment-form-section">
                  <div className="appointment-step">
                    1
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Quem será
                      atendido?
                    </h3>

                    <label>
                      Pet

                      <select
                        value={
                          petId
                        }
                        onChange={(
                          event,
                        ) =>
                          setPetId(
                            event
                              .target
                              .value,
                          )
                        }
                        required
                      >
                        <option value="">
                          Selecione
                          um pet
                        </option>

                        {pets.map(
                          (pet) => (
                            <option
                              key={
                                pet.id
                              }
                              value={
                                pet.id
                              }
                            >
                              {
                                pet.nome
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="appointment-form-section">
                  <div className="appointment-step">
                    2
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Qual serviço?
                    </h3>

                    <div className="appointment-fields-row">
                      <label>
                        Serviço

                        <select
                          value={
                            servicoId
                          }
                          onChange={(
                            event,
                          ) =>
                            setServicoId(
                              event
                                .target
                                .value,
                            )
                          }
                          required
                        >
                          <option value="">
                            Selecione
                            um serviço
                          </option>

                          {servicos.map(
                            (
                              servico,
                            ) => (
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
                      </label>

                      <label>
                        Profissional

                        <select
                          value={
                            profissionalId
                          }
                          onChange={(
                            event,
                          ) =>
                            setProfissionalId(
                              event
                                .target
                                .value,
                            )
                          }
                          disabled={
                            !servicoId ||
                            carregandoProfissionais
                          }
                          required
                        >
                          {!servicoId && (
                            <option value="">
                              Escolha
                              primeiro
                              um serviço
                            </option>
                          )}

                          {servicoId &&
                            carregandoProfissionais && (
                              <option value="">
                                Carregando...
                              </option>
                            )}

                          {servicoId &&
                            !carregandoProfissionais &&
                            profissionais.length ===
                              0 && (
                              <option value="">
                                Nenhum
                                profissional
                                disponível
                              </option>
                            )}

                          {servicoId &&
                            !carregandoProfissionais &&
                            profissionais.length >
                              0 && (
                              <option value="">
                                Selecione
                                um
                                profissional
                              </option>
                            )}

                          {profissionais.map(
                            (
                              profissional,
                            ) => (
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
                      </label>
                    </div>
                  </div>
                </div>

                <div className="appointment-form-section">
                  <div className="appointment-step">
                    3
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Quando?
                    </h3>

                    <label>
                      Data e horário

                      <input
                        type="datetime-local"
                        value={
                          dataHora
                        }
                        min={
                          dataHoraMinima
                        }
                        max={
                          dataHoraMaxima
                        }
                        onChange={(
                          event,
                        ) =>
                          setDataHora(
                            event
                              .target
                              .value,
                          )
                        }
                        required
                      />

                      <small>
                        Entre agora
                        e no máximo
                        1 ano no
                        futuro.
                      </small>
                    </label>
                  </div>
                </div>

                <div className="appointment-form-section">
                  <div className="appointment-step">
                    4
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Alguma
                      observação?
                    </h3>

                    <label>
                      Observações

                      <textarea
                        value={
                          observacoes
                        }
                        onChange={(
                          event,
                        ) =>
                          setObservacoes(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Ex.: informações importantes sobre o atendimento"
                        rows={4}
                      />
                    </label>
                  </div>
                </div>

                <div className="appointment-form-actions">
                  <Link
                    className="appointment-cancel-button"
                    to="/agendamentos"
                  >
                    Cancelar
                  </Link>

                  <button
                    className="appointment-submit-button"
                    type="submit"
                    disabled={
                      salvando ||
                      carregandoProfissionais ||
                      profissionais.length ===
                        0
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

          <aside className="appointment-info-card">
            <span className="appointment-info-eyebrow">
              Novo agendamento
            </span>

            <h2>
              Simples e rápido
            </h2>

            <p>
              Escolha as
              informações do
              atendimento e
              confirme o horário.
            </p>

            <div className="appointment-info-steps">
              <div>
                <span>
                  01
                </span>

                <div>
                  <strong>
                    Escolha o pet
                  </strong>

                  <p>
                    Apenas seus
                    pets ativos
                    ficam
                    disponíveis.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  02
                </span>

                <div>
                  <strong>
                    Serviço e
                    profissional
                  </strong>

                  <p>
                    O profissional
                    precisa
                    realizar o
                    serviço
                    selecionado.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  03
                </span>

                <div>
                  <strong>
                    Data e horário
                  </strong>

                  <p>
                    O sistema
                    verifica
                    conflitos
                    antes de
                    confirmar.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}