import { useEffect, useState, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router";

import CompleteProfilePage from "./pages/CompleteProfilePage";
import DashboardPage from "./pages/DashboardPage";
import EditPetPage from "./pages/EditPetPage";
import LoginPage from "./pages/LoginPage";
import NewPetPage from "./pages/NewPetPage";
import PetsPage from "./pages/PetsPage";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: "CLIENTE" | "ATENDENTE" | "ADMINISTRADOR";
  ativo: boolean;
  clienteId: number | null;
};

type ProtectedRouteProps = {
  children: ReactNode;
  exigirCliente?: boolean;
};

function ProtectedRoute({
  children,
  exigirCliente = true,
}: ProtectedRouteProps) {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    async function verificarSessao() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          setUsuario(null);
          return;
        }

        const data = await response.json();

        setUsuario(data.usuario);
      } catch {
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    }

    verificarSessao();
  }, []);

  if (carregando) {
    return <p>Carregando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (exigirCliente && usuario.clienteId === null) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (!exigirCliente && usuario.clienteId !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute exigirCliente={false}>
              <CompleteProfilePage />
            </ProtectedRoute>
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
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;