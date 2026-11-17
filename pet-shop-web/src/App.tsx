import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router";

import AppointmentsPage from "./pages/AppointmentsPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import DashboardPage from "./pages/DashboardPage";
import EditPetPage from "./pages/EditPetPage";
import LoginPage from "./pages/LoginPage";
import NewAppointmentPage from "./pages/NewAppointmentPage";
import NewPetPage from "./pages/NewPetPage";
import PetsPage from "./pages/PetsPage";
import ProfessionalsPage from "./pages/ProfessionalsPage";

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

type AuthResponse =
  | Usuario
  | {
      usuario: Usuario;
    }
  | {
      user: Usuario;
    };

type ProtectedRouteProps = {
  children: ReactNode;

  perfisPermitidos?: PerfilUsuario[];
};

function extrairUsuario(
  data: AuthResponse,
): Usuario {
  if ("usuario" in data) {
    return data.usuario;
  }

  if ("user" in data) {
    return data.user;
  }

  return data;
}

function ProtectedRoute({
  children,
  perfisPermitidos,
}: ProtectedRouteProps) {
  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    usuario,
    setUsuario,
  ] = useState<Usuario | null>(
    null,
  );

  const [
    autenticado,
    setAutenticado,
  ] = useState(false);

  useEffect(() => {
    async function verificarSessao() {
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
          setAutenticado(
            false,
          );

          return;
        }

        const data =
          (await response.json()) as AuthResponse;

        setUsuario(
          extrairUsuario(
            data,
          ),
        );

        setAutenticado(
          true,
        );
      } catch {
        setAutenticado(
          false,
        );
      } finally {
        setCarregando(
          false,
        );
      }
    }

    void verificarSessao();
  }, []);

  if (carregando) {
    return null;
  }

  if (
    !autenticado ||
    !usuario
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * Cliente precisa completar
   * os dados antes de utilizar
   * o sistema.
   *
   * Administrador e atendente
   * não dependem de clienteId.
   */
  if (
    usuario.perfil ===
      "CLIENTE" &&
    !usuario.clienteId
  ) {
    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }

  if (
    perfisPermitidos &&
    !perfisPermitidos.includes(
      usuario.perfil,
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/complete-profile"
          element={
            <CompleteProfilePage />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pets"
          element={
            <ProtectedRoute>
              <PetsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pets/novo"
          element={
            <ProtectedRoute>
              <NewPetPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pets/:id/editar"
          element={
            <ProtectedRoute>
              <EditPetPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agendamentos"
          element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agendamentos/novo"
          element={
            <ProtectedRoute>
              <NewAppointmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/profissionais"
          element={
            <ProtectedRoute
              perfisPermitidos={[
                "ATENDENTE",
                "ADMINISTRADOR",
              ]}
            >
              <ProfessionalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}