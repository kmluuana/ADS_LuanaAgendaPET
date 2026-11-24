import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router";

type PerfilUsuario =
  | "CLIENTE"
  | "ATENDENTE"
  | "ADMINISTRADOR";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  clienteId?: number | null;
};

type AuthResponse = {
  usuario: Usuario;
};

export default function Sidebar() {
  const navigate = useNavigate();

  const [
    perfil,
    setPerfil,
  ] = useState<PerfilUsuario | null>(
    null,
  );

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const response =
          await fetch(
            "/api/auth/me",
            {
              credentials:
                "include",
            },
          );

        if (!response.ok) {
          return;
        }

        const data =
          (await response.json()) as AuthResponse;

        setPerfil(
          data.usuario.perfil,
        );
      } catch {
        setPerfil(null);
      }
    }

    void carregarUsuario();
  }, []);

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

  const podeAdministrar =
    perfil === "ATENDENTE" ||
    perfil === "ADMINISTRADOR";

  return (
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
              A
            </span>

            Agendamentos
          </NavLink>

          {podeAdministrar && (
            <>
              <div className="admin-menu-label">
                Administração
              </div>

              <NavLink
                to="/admin/profissionais"
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
                  F
                </span>

                Profissionais
              </NavLink>

              <NavLink
                to="/admin/servicos"
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
                  S
                </span>

                Serviços
              </NavLink>
            </>
          )}
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
  );
}