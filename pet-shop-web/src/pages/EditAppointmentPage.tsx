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
  useNavigate,
  useParams,
} from "react-router";

import Sidebar from "../components/Sidebar";

import "./DashboardPage.css";
import "./AppointmentFormPage.css";

type Pet = {
  id: number;
  nome: string;
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

type Agendamento = {
  id: number;
  dataHora: string;
  status:
    | "AGENDADO"
    | "CONCLUIDO"
    | "CANCELADO";

  observacoes?: string | null;

  pet: Pet;
  servico: Servico;
  profissional: Profissional;
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
  const limite =
    new Date();

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

export default function EditAppointmentPage() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const [
    agendamento,
    setAgendamento,
  ] = useState<Agendamento | null>(
    null,
  );

  const [
    servicos,
    setServicos,
  ] = useState<Servico[]>([]);

  const [
    profissionais,
    setProfissionais,
  ] = useState<Profissional[]>([]);

  const [
    servicoId,
    setServicoId,
  ] = useState("");

  const [
    profissionalId,
    setProfissionalId,
  ] = useState("");

  const [
    dataHora,
    setDataHora,
  ] = useState("");

  const [
    observacoes,
    setObservacoes,
  ] = useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    carregandoProfissionais,
    setCarregandoProfissionais,
  ] = useState(false);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    inicializado,
    setInicializado,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState("");

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
      if (!id) {
        navigate(
          "/agendamentos",
        );

        return;
      }

      setCarregando(true);
      setErro("");

      try {
        const [
          agendamentoResponse,
          servicosResponse,
        ] = await Promise.all([
          fetch(
            `/api/agendamentos/${id}`,
            {
              credentials:
                "include",
            },
          ),

          fetch(
            "/api/servicos",
            {
              credentials:
                "include",
            },
          ),
        ]);

        if (
          agendamentoResponse.status ===
          403
        ) {
          navigate(
            "/dashboard",
          );

          return;
        }

        if (
          !agendamentoResponse.ok
        ) {
          throw new Error(
            await obterMensagemErro(
              agendamentoResponse,
              "Não foi possível carregar o agendamento",
            ),
          );
        }

        if (
          !servicosResponse.ok
        ) {
          throw new Error(
            await obterMensagemErro(
              servicosResponse,
              "Não foi possível carregar os serviços",
            ),
          );
        }

        const agendamentoData =
          (await agendamentoResponse.json()) as Agendamento;

        const servicosData =
          (await servicosResponse.json()) as Servico[];

        if (
          agendamentoData.status !==
          "AGENDADO"
        ) {
          setErro(
            "Somente agendamentos ativos podem ser editados",
          );

          setAgendamento(
            agendamentoData,
          );

          return;
        }

        setAgendamento(
          agendamentoData,
        );

        setServicos(
          servicosData.filter(
            (servico) =>
              servico.ativo ||
              servico.id ===
                agendamentoData.servico.id,
          ),
        );

        setServicoId(
          String(
            agendamentoData.servico.id,
          ),
        );

        setProfissionalId(
          String(
            agendamentoData.profissional.id,
          ),
        );

        setDataHora(
          formatarDataHoraLocal(
            new Date(
              agendamentoData.dataHora,
            ),
          ),
        );

        setObservacoes(
          agendamentoData.observacoes ??
            "",
        );

        setInicializado(true);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o agendamento",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarDados();
  }, [
    id,
    navigate,
  ]);

  useEffect(() => {
    async function carregarProfissionais() {
      if (
        !servicoId ||
        !inicializado
      ) {
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

        const profissionalAtualExiste =
          ativos.some(
            (profissional) =>
              String(
                profissional.id,
              ) ===
              profissionalId,
          );

        if (
          !profissionalAtualExiste
        ) {
          if (
            ativos.length === 1
          ) {
            setProfissionalId(
              String(
                ativos[0].id,
              ),
            );
          } else {
            setProfissionalId(
              "",
            );
          }
        }
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os profissionais",
        );
      } finally {
        setCarregandoProfissionais(
          false,
        );
      }
    }

    void carregarProfissionais();
  }, [
    servicoId,
    inicializado,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !agendamento ||
      !servicoId ||
      !profissionalId ||
      !dataHora
    ) {
      setErro(
        "Preencha todos os campos obrigatórios",
      );

      return;
    }

    setErro("");

    const dataSelecionada =
      new Date(
        dataHora,
      );

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
          `/api/agendamentos/${agendamento.id}`,
          {
            method: "PUT",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                petId:
                  agendamento.pet.id,

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
            "Não foi possível editar o agendamento",
          ),
        );
      }

      navigate(
        "/agendamentos",
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível editar o agendamento",
      );
    } finally {
      setSalvando(false);
    }
  }

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
              Buscando os dados
              do agendamento.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="empty-state">
            <h3>
              Agendamento não encontrado
            </h3>

            <Link
              to="/agendamentos"
              className="primary-button"
            >
              Voltar
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="appointment-page-header">
          <div>
            <span className="dashboard-eyebrow">
              Agenda
            </span>

            <h1>
              Editar agendamento
            </h1>

            <p>
              Altere os dados
              necessários do
              atendimento.
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
                E
              </div>

              <div>
                <h2>
                  Dados do agendamento
                </h2>

                <p>
                  Atualize as informações
                  do atendimento.
                </p>
              </div>
            </div>

            {agendamento.status ===
            "AGENDADO" ? (
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
                      Pet
                    </h3>

                    <label>
                      Pet atendido

                      <input
                        type="text"
                        value={
                          agendamento.pet
                            .nome
                        }
                        disabled
                      />

                      <small>
                        O pet não pode ser
                        alterado neste
                        agendamento.
                      </small>
                    </label>
                  </div>
                </div>

                <div className="appointment-form-section">
                  <div className="appointment-step">
                    2
                  </div>

                  <div className="appointment-section-content">
                    <h3>
                      Serviço e profissional
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
                          ) => {
                            setServicoId(
                              event
                                .target
                                .value,
                            );

                            setProfissionalId(
                              "",
                            );
                          }}
                          required
                        >
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
                            carregandoProfissionais
                          }
                          required
                        >
                          {carregandoProfissionais ? (
                            <option value="">
                              Carregando...
                            </option>
                          ) : (
                            <>
                              <option value="">
                                Selecione um profissional
                              </option>

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
                            </>
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
                        Entre agora e no
                        máximo 1 ano no
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
                      Observações
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
                      !profissionalId
                    }
                  >
                    {salvando
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="empty-state">
                <h3>
                  Este agendamento não pode ser editado
                </h3>

                <p>
                  Apenas agendamentos
                  com status AGENDADO
                  podem ser alterados.
                </p>
              </div>
            )}
          </section>

          <aside className="appointment-info-card">
            <span className="appointment-info-eyebrow">
              Editar agendamento
            </span>

            <h2>
              Ajuste o atendimento
            </h2>

            <p>
              Altere o serviço,
              profissional ou horário
              quando necessário.
            </p>

            <div className="appointment-info-steps">
              <div>
                <span>
                  01
                </span>

                <div>
                  <strong>
                    Pet mantido
                  </strong>

                  <p>
                    O agendamento continua
                    vinculado ao mesmo pet.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  02
                </span>

                <div>
                  <strong>
                    Serviço e profissional
                  </strong>

                  <p>
                    Apenas profissionais
                    ativos do serviço
                    ficam disponíveis.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  03
                </span>

                <div>
                  <strong>
                    Novo horário
                  </strong>

                  <p>
                    As regras de conflito
                    continuam sendo
                    verificadas.
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