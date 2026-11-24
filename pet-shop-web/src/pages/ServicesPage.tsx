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
import "./ServicesPage.css";

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

type Servico = {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: string;
  duracao: number;
  ativo: boolean;
};

type ApiError = {
  message?: string;
};

type FormularioServico = {
  nome: string;
  descricao: string;
  preco: string;
  duracao: string;
};

const formularioInicial: FormularioServico = {
  nome: "",
  descricao: "",
  preco: "",
  duracao: "",
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

function formatarPreco(
  preco: string,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(
    Number(preco),
  );
}

export default function ServicesPage() {
  const navigate =
    useNavigate();

  const [
    perfil,
    setPerfil,
  ] = useState<PerfilUsuario | null>(
    null,
  );

  const [
    servicos,
    setServicos,
  ] = useState<Servico[]>([]);

  const [
    formulario,
    setFormulario,
  ] = useState<FormularioServico>(
    formularioInicial,
  );

  const [
    servicoEditando,
    setServicoEditando,
  ] = useState<number | null>(
    null,
  );

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
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

      if (!authResponse.ok) {
        throw new Error(
          await obterMensagemErro(
            authResponse,
            "Não foi possível carregar o usuário",
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

      const authData =
        (await authResponse.json()) as AuthResponse;

      const servicosData =
        (await servicosResponse.json()) as Servico[];

      if (
        authData.usuario.perfil ===
        "CLIENTE"
      ) {
        navigate(
          "/dashboard",
        );

        return;
      }

      setPerfil(
        authData.usuario.perfil,
      );

      setServicos(
        servicosData,
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

  function abrirNovoServico() {
    if (!podeEditar) {
      return;
    }

    setServicoEditando(
      null,
    );

    setFormulario(
      formularioInicial,
    );

    setErro("");

    setMostrarFormulario(
      true,
    );
  }

  function abrirEdicao(
    servico: Servico,
  ) {
    if (!podeEditar) {
      return;
    }

    setServicoEditando(
      servico.id,
    );

    setFormulario({
      nome:
        servico.nome,

      descricao:
        servico.descricao ?? "",

      preco:
        String(
          servico.preco,
        ),

      duracao:
        String(
          servico.duracao,
        ),
    });

    setErro("");

    setMostrarFormulario(
      true,
    );
  }

  function fecharFormulario() {
    setMostrarFormulario(
      false,
    );

    setServicoEditando(
      null,
    );

    setFormulario(
      formularioInicial,
    );

    setErro("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!podeEditar) {
      return;
    }

    setErro("");

    const preco =
      Number(
        formulario.preco.replace(
          ",",
          ".",
        ),
      );

    const duracao =
      Number(
        formulario.duracao,
      );

    if (
      !formulario.nome.trim()
    ) {
      setErro(
        "Informe o nome do serviço",
      );

      return;
    }

    if (
      !Number.isFinite(preco) ||
      preco <= 0
    ) {
      setErro(
        "Informe um preço válido",
      );

      return;
    }

    if (
      !Number.isInteger(
        duracao,
      ) ||
      duracao <= 0
    ) {
      setErro(
        "Informe uma duração válida",
      );

      return;
    }

    setSalvando(true);

    try {
      const url =
        servicoEditando
          ? `/api/servicos/${servicoEditando}`
          : "/api/servicos";

      const method =
        servicoEditando
          ? "PUT"
          : "POST";

      const response =
        await fetch(
          url,
          {
            method,

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                nome:
                  formulario.nome,

                descricao:
                  formulario.descricao,

                preco,

                duracao,
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await obterMensagemErro(
            response,
            servicoEditando
              ? "Não foi possível editar o serviço"
              : "Não foi possível cadastrar o serviço",
          ),
        );
      }

      fecharFormulario();

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o serviço",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(
    servico: Servico,
  ) {
    if (!podeEditar) {
      return;
    }

    setErro("");

    try {
      const response =
        await fetch(
          `/api/servicos/${servico.id}/ativo`,
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
                  !servico.ativo,
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await obterMensagemErro(
            response,
            "Não foi possível alterar o status do serviço",
          ),
        );
      }

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do serviço",
      );
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="services-header">
          <div>
            <span className="dashboard-eyebrow">
              Administração
            </span>

            <h1>
              Serviços
            </h1>

            <p>
              {podeEditar
                ? "Cadastre e gerencie os serviços oferecidos."
                : "Consulte os serviços cadastrados no sistema."}
            </p>
          </div>

          {podeEditar && (
            <button
              type="button"
              className="services-new-button"
              onClick={
                abrirNovoServico
              }
            >
              + Novo serviço
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
            <section className="service-form-card">
              <div className="service-form-header">
                <div>
                  <span className="panel-eyebrow">
                    {servicoEditando
                      ? "Editar"
                      : "Novo"}
                  </span>

                  <h2>
                    {servicoEditando
                      ? "Editar serviço"
                      : "Cadastrar serviço"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="service-close-button"
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
                <div className="service-form-grid">
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
                        setFormulario({
                          ...formulario,
                          nome:
                            event
                              .target
                              .value,
                        })
                      }
                      placeholder="Ex.: Banho Premium"
                    />
                  </label>

                  <label>
                    Preço

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        formulario.preco
                      }
                      onChange={(
                        event,
                      ) =>
                        setFormulario({
                          ...formulario,
                          preco:
                            event
                              .target
                              .value,
                        })
                      }
                      placeholder="80,00"
                    />
                  </label>

                  <label>
                    Duração em minutos

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formulario.duracao
                      }
                      onChange={(
                        event,
                      ) =>
                        setFormulario({
                          ...formulario,
                          duracao:
                            event
                              .target
                              .value,
                        })
                      }
                      placeholder="60"
                    />
                  </label>

                  <label className="service-description-field">
                    Descrição

                    <textarea
                      value={
                        formulario.descricao
                      }
                      onChange={(
                        event,
                      ) =>
                        setFormulario({
                          ...formulario,
                          descricao:
                            event
                              .target
                              .value,
                        })
                      }
                      placeholder="Descrição do serviço"
                      rows={4}
                    />
                  </label>
                </div>

                <div className="service-form-actions">
                  <button
                    type="button"
                    className="service-cancel-button"
                    onClick={
                      fecharFormulario
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="services-new-button"
                    disabled={
                      salvando
                    }
                  >
                    {salvando
                      ? "Salvando..."
                      : "Salvar serviço"}
                  </button>
                </div>
              </form>
            </section>
          )}

        <section className="services-list-card">
          <div className="services-list-header">
            <div>
              <span className="panel-eyebrow">
                Catálogo
              </span>

              <h2>
                Serviços cadastrados
              </h2>
            </div>

            <span className="service-count">
              {servicos.length}{" "}
              {servicos.length === 1
                ? "serviço"
                : "serviços"}
            </span>
          </div>

          {carregando ? (
            <div className="empty-state">
              <h3>
                Carregando...
              </h3>
            </div>
          ) : servicos.length === 0 ? (
            <div className="empty-state">
              <h3>
                Nenhum serviço cadastrado
              </h3>
            </div>
          ) : (
            <div className="services-list">
              {servicos.map(
                (servico) => (
                  <div
                    key={
                      servico.id
                    }
                    className="service-row"
                  >
                    <div className="service-main-info">
                      <div className="service-avatar">
                        S
                      </div>

                      <div>
                        <div className="service-name-line">
                          <strong>
                            {
                              servico.nome
                            }
                          </strong>

                          <span
                            className={
                              servico.ativo
                                ? "service-status active"
                                : "service-status inactive"
                            }
                          >
                            {servico.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </div>

                        <span className="service-description">
                          {servico.descricao ||
                            "Sem descrição"}
                        </span>

                        <div className="service-meta">
                          <span>
                            {formatarPreco(
                              servico.preco,
                            )}
                          </span>

                          <span>
                            {
                              servico.duracao
                            }{" "}
                            min
                          </span>
                        </div>
                      </div>
                    </div>

                    {podeEditar && (
                      <div className="service-actions">
                        <button
                          type="button"
                          className="service-edit-button"
                          onClick={() =>
                            abrirEdicao(
                              servico,
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={
                            servico.ativo
                              ? "service-status-button danger"
                              : "service-status-button success"
                          }
                          onClick={() =>
                            void alterarStatus(
                              servico,
                            )
                          }
                        >
                          {servico.ativo
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