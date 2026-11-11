import { Link, useNavigate } from "react-router";

export default function DashboardPage() {
  const navigate = useNavigate();

  async function sair() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  }

  return (
    <main>
      <h1>Agenda Pet</h1>

      <h2>Dashboard</h2>

      <p>Você está autenticado.</p>

      <nav>
        <p>
          <Link to="/pets">Meus Pets</Link>
        </p>

        <p>
          <Link to="/pets/novo">Cadastrar novo pet</Link>
        </p>
      </nav>

      <button type="button" onClick={sair}>
        Sair
      </button>
    </main>
  );
}