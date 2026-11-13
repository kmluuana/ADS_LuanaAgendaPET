import {
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";

import "./DashboardPage.css";
import "./PetFormPage.css";

export default function NewPetPage() {
  const navigate = useNavigate();

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

  const [erro, setErro] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  async function cadastrarPet(
    event: FormEvent,
  ) {
    event.preventDefault();

    setErro("");
    setSalvando(true);

    try {
      const response = await fetch(
        "/api/pets",
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            nome: nome.trim(),
            especie: especie.trim(),

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
            "Não foi possível cadastrar o pet",
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
              Cadastrar novo pet
            </h1>

            <p>
              Adicione as informações
              básicas do seu companheiro.
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
                +
              </div>

              <div>
                <h2>
                  Dados do pet
                </h2>

                <p>
                  Preencha os campos
                  abaixo para continuar.
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
              onSubmit={cadastrarPet}
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
                  placeholder="Ex.: Zoe"
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
                    placeholder="Ex.: SRD"
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
                    : "Cadastrar pet"}
                </button>
              </div>
            </form>
          </section>

          <aside className="pet-form-info">
            <div className="pet-form-info-badge">
              P
            </div>

            <h2>
              Cadastro simples
            </h2>

            <p>
              Essas informações ajudam
              a identificar seu pet
              durante os agendamentos.
            </p>

            <div className="pet-form-info-item">
              <strong>
                Nome e espécie
              </strong>

              <span>
                São as informações
                principais do cadastro.
              </span>
            </div>

            <div className="pet-form-info-item">
              <strong>
                Raça
              </strong>

              <span>
                Pode ser deixada em
                branco caso não saiba.
              </span>
            </div>

            <div className="pet-form-info-item">
              <strong>
                Observações
              </strong>

              <span>
                Use para registrar
                informações relevantes.
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}