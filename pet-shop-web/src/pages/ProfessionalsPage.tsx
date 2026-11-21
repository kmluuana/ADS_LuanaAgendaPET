import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router";

import Sidebar from "../components/Sidebar";

import "./DashboardPage.css";
import "./ProfessionalsPage.css";

type PerfilUsuario =
  | "CLIENTE"
  | "ATENDENTE"
  | "ADMINISTRADOR";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
};

type AuthResponse = {
  usuario: Usuario;
};

type Profissional = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
};

type Servico = {
  id: number;
  nome: string;
  duracao: number;
  ativo: boolean;
};

type ApiError = {
  message?: string;
};

type FormularioProfissional = {
  nome: string;
  email: string;
  telefone: string;
};

const formularioInicial: FormularioProfissional = {
  nome: "",
  email: "",
  telefone: "",
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

function formatarTelefone(
  telefone: string,
) {
  const numeros =
    telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3",
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      "($1) $2-$3",
    );
  }

  return telefone;
}

export default function ProfessionalsPage() {
  const navigate =
    useNavigate();

  const [
    perfil,
    setPerfil,
  ] = useState<PerfilUsuario | null>(
    null,
  );

  const [
    profissionais,
    setProfissionais,
  ] = useState<Profissional[]>([]);

  const [
    servicos,
    setServicos,
  ] = useState<Servico[]>([]);

  const [
    formulario,
    setFormulario,
  ] = useState<FormularioProfissional>(
    formularioInicial,
  );

  const [
    servicosSelecionados,
    setServicosSelecionados,
  ] = useState<number[]>([]);

  const [
    servicosOriginais,
    setServicosOriginais,
  ] = useState<number[]>([]);

  const [
    profissionalEditando,
    setProfissionalEditando,
  ] = useState<number | null>(
    null,
  );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const podeEditar =
    perfil === "ADMINISTRADOR";

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [
        authResponse,
        profissionaisResponse,
        servicosResponse,
      ] = await Promise.all([
        fetch(
          "/api/auth/me",
          {
            credentials:
              "include",
          },
        ),

        fetch(
          "/api/profissionais",
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
        authResponse.status === 401
      ) {
        navigate(
          "/login",
        );

        return;
      }

      if (
        profissionaisResponse.status ===
        403
      ) {
        navigate(
          "/dashboard",
        );

        return;
      }

      if (!authResponse.ok) {
        throw new Error(
          await obterMensagemErro(
            authResponse,
            "Não foi possível carregar o usuário",
          ),
        );
      }

      if (
        !profissionaisResponse.ok
      ) {
        throw new Error(
          await obterMensagemErro(
            profissionaisResponse,
            "Não foi possível carregar os profissionais",
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

      const authData =
        (await authResponse.json()) as AuthResponse;

      const profissionaisData =
        (await profissionaisResponse.json()) as Profissional[];

      const servicosData =
        (await servicosResponse.json()) as Servico[];

      setPerfil(
        authData.usuario.perfil,
      );

      setProfissionais(
        profissionaisData,
      );

      setServicos(
        servicosData.filter(
          (servico) =>
            servico.ativo,
        ),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  function abrirNovoProfissional() {
    if (!podeEditar) {
      return;
    }

    setProfissionalEditando(
      null,
    );

    setFormulario(
      formularioInicial,
    );

    setServicosSelecionados(
      [],
    );

    setServicosOriginais(
      [],
    );

    setErro("");

    setMostrarFormulario(
      true,
    );
  }

  async function abrirEdicao(
    profissional: Profissional,
  ) {
    if (!podeEditar) {
      return;
    }

    setErro("");

    try {
      const response =
        await fetch(
          `/api/profissionais/${profissional.id}/servicos`,
          {
            credentials:
              "include",
          },
        );

      if (!response.ok) {
        throw new Error(
          await obterMensagemErro(
            response,
            "Não foi possível carregar os serviços do profissional",
          ),
        );
      }

      const servicosProfissional =
        (await response.json()) as Servico[];

      const ids =
        servicosProfissional.map(
          (servico) =>
            servico.id,
        );

      setProfissionalEditando(
        profissional.id,
      );

      setFormulario({
        nome:
          profissional.nome,
        email:
          profissional.email,
        telefone:
          profissional.telefone,
      });

      setServicosSelecionados(
        ids,
      );

      setServicosOriginais(
        ids,
      );

      setMostrarFormulario(
        true,
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível editar o profissional",
      );
    }
  }

  function fecharFormulario() {
    setMostrarFormulario(
      false,
    );

    setProfissionalEditando(
      null,
    );

    setFormulario(
      formularioInicial,
    );

    setServicosSelecionados(
      [],
    );

    setServicosOriginais(
      [],
    );

    setErro("");
  }

  function alterarServico(
    servicoId: number,
  ) {
    if (!podeEditar) {
      return;
    }

    setServicosSelecionados(
      (atuais) => {
        if (
          atuais.includes(
            servicoId,
          )
        ) {
          return atuais.filter(
            (id) =>
              id !== servicoId,
          );
        }

        return [
          ...atuais,
          servicoId,
        ];
      },
    );
  }

  async function sincronizarServicos(
    profissionalId: number,
  ) {
    const adicionar =
      servicosSelecionados.filter(
        (servicoId) =>
          !servicosOriginais.includes(
            servicoId,
          ),
      );

    const remover =
      servicosOriginais.filter(
        (servicoId) =>
          !servicosSelecionados.includes(
            servicoId,
          ),
      );

    for (
      const servicoId
      of adicionar
    ) {
      const response =
        await fetch(
          `/api/profissionais/${profissionalId}/servicos/${servicoId}`,
          {
            method: "POST",
            credentials:
              "include",
          },
        );

      if (!response.ok) {
        throw new Error(
          await obterMensagemErro(
            response,
            "Não foi possível vincular o serviço",
          ),
        );
      }
    }

    for (
      const servicoId
      of remover
    ) {
      const response =
        await fetch(
          `/api/profissionais/${profissionalId}/servicos/${servicoId}`,
          {
            method: "DELETE",
            credentials:
              "include",
          },
        );

      if (!response.ok) {
        throw new Error(
          await obterMensagemErro(
            response,
            "Não foi possível remover o serviço",
          ),
        );
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!podeEditar) {
      setErro(
        "Você não possui permissão para alterar profissionais",
      );

      return;
    }

    setErro("");

    if (
      !formulario.nome.trim() ||
      !formulario.email.trim() ||
      !formulario.telefone.trim()
    ) {
      setErro(
        "Preencha nome, e-mail e telefone",
      );

      return;
    }

    if (
      servicosSelecionados.length ===
      0
    ) {
      setErro(
        "Selecione pelo menos um serviço para o profissional",
      );

      return;
    }

    setSalvando(true);

    try {
      let profissionalId =
        profissionalEditando;

      if (
        profissionalEditando
      ) {
        const response =
          await fetch(
            `/api/profissionais/${profissionalEditando}`,
            {
              method: "PUT",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  formulario,
                ),
            },
          );

        if (!response.ok) {
          throw new Error(
            await obterMensagemErro(
              response,
              "Não foi possível editar o profissional",
            ),
          );
        }
      } else {
        const response =
          await fetch(
            "/api/profissionais",
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  formulario,
                ),
            },
          );

        if (!response.ok) {
          throw new Error(
            await obterMensagemErro(
              response,
              "Não foi possível cadastrar o profissional",
            ),
          );
        }

        const profissionalCriado =
          (await response.json()) as Profissional;

        profissionalId =
          profissionalCriado.id;
      }

      if (!profissionalId) {
        throw new Error(
          "Profissional inválido",
        );
      }

      await sincronizarServicos(
        profissionalId,
      );

      fecharFormulario();

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o profissional",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(
    profissional: Profissional,
  ) {
    if (!podeEditar) {
      setErro(
        "Você não possui permissão para alterar profissionais",
      );

      return;
    }

    setErro("");

    try {
      const response =
        await fetch(
          `/api/profissionais/${profissional.id}/status`,
          {
            method: "PATCH",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ativo:
                  !profissional.ativo,
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await obterMensagemErro(
            response,
            "Não foi possível alterar o status",
          ),
        );
      }

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status",
      );
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="professionals-header">
          <div>
            <span className="dashboard-eyebrow">
              Administração
            </span>

            <h1>
              Profissionais
            </h1>

            <p>
              {podeEditar
                ? "Cadastre e gerencie os profissionais e os serviços que cada um realiza."
                : "Consulte os profissionais cadastrados no sistema."}
            </p>
          </div>

          {podeEditar && (
            <button
              type="button"
              className="professionals-new-button"
              onClick={
                abrirNovoProfissional
              }
            >
              + Novo profissional
            </button>
          )}
        </header>

        {erro && (
          <div className="dashboard-error">
            {erro}
          </div>
        )}

        {podeEditar &&
          mostrarFormulario && (
            <section className="professional-form-card">
              <div className="professional-form-header">
                <div>
                  <span className="panel-eyebrow">
                    {profissionalEditando
                      ? "Editar"
                      : "Novo"}
                  </span>

                  <h2>
                    {profissionalEditando
                      ? "Editar profissional"
                      : "Cadastrar profissional"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="professional-close-button"
                  onClick={
                    fecharFormulario
                  }
                >
                  Fechar
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
              >
                <div className="professional-form-grid">
                  <label>
                    Nome

                    <input
                      type="text"
                      value={
                        formulario.nome
                      }
                      onChange={(
                        event,
                      ) =>
                        setFormulario(
                          {
                            ...formulario,

                            nome:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      placeholder="Nome completo"
                    />
                  </label>

                  <label>
                    E-mail

                    <input
                      type="email"
                      value={
                        formulario.email
                      }
                      onChange={(
                        event,
                      ) =>
                        setFormulario(
                          {
                            ...formulario,

                            email:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      placeholder="email@exemplo.com"
                    />
                  </label>

                  <label>
                    Telefone

                    <input
                      type="text"
                      value={
                        formulario.telefone
                      }
                      onChange={(
                        event,
                      ) =>
                        setFormulario(
                          {
                            ...formulario,

                            telefone:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      placeholder="(54) 99999-9999"
                    />
                  </label>
                </div>

                <div className="professional-services-section">
                  <h3>
                    Serviços que realiza
                  </h3>

                  <p>
                    Selecione os
                    serviços que
                    poderão ser
                    agendados com
                    este profissional.
                  </p>

                  <div className="professional-services-list">
                    {servicos.map(
                      (servico) => (
                        <label
                          key={
                            servico.id
                          }
                          className="professional-service-option"
                        >
                          <input
                            type="checkbox"
                            checked={
                              servicosSelecionados.includes(
                                servico.id,
                              )
                            }
                            onChange={() =>
                              alterarServico(
                                servico.id,
                              )
                            }
                          />

                          <div>
                            <strong>
                              {
                                servico.nome
                              }
                            </strong>

                            <span>
                              {
                                servico.duracao
                              }{" "}
                              min
                            </span>
                          </div>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                <div className="professional-form-actions">
                  <button
                    type="button"
                    className="professional-cancel-button"
                    onClick={
                      fecharFormulario
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="professionals-new-button"
                    disabled={
                      salvando
                    }
                  >
                    {salvando
                      ? "Salvando..."
                      : "Salvar profissional"}
                  </button>
                </div>
              </form>
            </section>
          )}

        <section className="professionals-list-card">
          <div className="professional-list-header">
            <div>
              <span className="panel-eyebrow">
                Equipe
              </span>

              <h2>
                Profissionais cadastrados
              </h2>
            </div>

            <span className="professional-count">
              {
                profissionais.length
              }{" "}
              profissionais
            </span>
          </div>

          {carregando ? (
            <div className="empty-state">
              <h3>
                Carregando...
              </h3>
            </div>
          ) : profissionais.length ===
            0 ? (
            <div className="empty-state">
              <h3>
                Nenhum profissional cadastrado
              </h3>

              <p>
                Nenhum profissional
                foi encontrado.
              </p>
            </div>
          ) : (
            <div className="professionals-list">
              {profissionais.map(
                (
                  profissional,
                ) => (
                  <div
                    key={
                      profissional.id
                    }
                    className="professional-row"
                  >
                    <div className="professional-main-info">
                      <div className="professional-avatar">
                        {profissional.nome
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="professional-name-line">
                          <strong>
                            {
                              profissional.nome
                            }
                          </strong>

                          <span
                            className={
                              profissional.ativo
                                ? "professional-status active"
                                : "professional-status inactive"
                            }
                          >
                            {profissional.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </div>

                        <span>
                          {
                            profissional.email
                          }
                        </span>

                        <span>
                          {formatarTelefone(
                            profissional.telefone,
                          )}
                        </span>
                      </div>
                    </div>

                    {podeEditar && (
                      <div className="professional-actions">
                        <button
                          type="button"
                          className="professional-edit-button"
                          onClick={() =>
                            void abrirEdicao(
                              profissional,
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={
                            profissional.ativo
                              ? "professional-status-button danger"
                              : "professional-status-button success"
                          }
                          onClick={() =>
                            void alterarStatus(
                              profissional,
                            )
                          }
                        >
                          {profissional.ativo
                            ? "Inativar"
                            : "Ativar"}
                        </button>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}