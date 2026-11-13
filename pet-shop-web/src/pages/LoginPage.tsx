import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;

  renderButton: (
    element: HTMLElement,
    config: {
      theme: string;
      size: string;
      text?: string;
      shape?: string;
      width?: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }
      } catch {
        // Usuário ainda não autenticado.
      }

      setCarregando(false);
    }

    verificarSessao();
  }, [navigate]);

  useEffect(() => {
    if (carregando) {
      return;
    }

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setErro(
        "VITE_GOOGLE_CLIENT_ID não configurado",
      );

      return;
    }

    function configurarGoogle() {
      if (
        !window.google ||
        !googleButtonRef.current
      ) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: async (
          googleResponse: GoogleCredentialResponse,
        ) => {
          try {
            setErro("");

            const response = await fetch(
              "/api/auth/google",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  idToken:
                    googleResponse.credential,
                }),
              },
            );

            const data = await response.json();

            if (!response.ok) {
              setErro(
                data.message ??
                  "Não foi possível realizar o login",
              );

              return;
            }

            navigate("/dashboard", {
              replace: true,
            });
          } catch {
            setErro(
              "Não foi possível conectar com a API",
            );
          }
        },
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 320,
        },
      );

      return true;
    }

    if (configurarGoogle()) {
      return;
    }

    const interval = window.setInterval(() => {
      if (configurarGoogle()) {
        window.clearInterval(interval);
      }
    }, 200);

    return () => {
      window.clearInterval(interval);
    };
  }, [carregando, navigate]);

  if (carregando) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Carregando...</span>
      </div>
    );
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-badge">
          Agenda Pet
        </div>

        <div className="brand-content">
          <h1>
            Cuidado organizado.
            <br />
            Rotina mais tranquila.
          </h1>

          <p>
            Gerencie pets, serviços e
            agendamentos em um só lugar.
          </p>
        </div>

        <div className="brand-footer">
          Agenda Pet
        </div>
      </section>

      <section className="login-area">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-logo">
              AP
            </div>

            <div>
              <span className="eyebrow">
                Bem-vindo
              </span>

              <h2>Acesse sua conta</h2>
            </div>
          </div>

          <p className="login-description">
            Entre com sua conta Google para
            acessar seus pets e agendamentos.
          </p>

          <div
            className="google-button-container"
            ref={googleButtonRef}
          />

          {erro && (
            <div className="error-message">
              {erro}
            </div>
          )}

          <p className="login-help">
            Seu acesso é protegido e nenhuma
            senha do Google é armazenada pelo
            Agenda Pet.
          </p>
        </div>
      </section>
    </main>
  );
}