import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;

          renderButton: (
            element: HTMLElement,
            options: {
              theme: string;
              size: string;
              text?: string;
              shape?: string;
            },
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!window.google) {
        return;
      }

      window.clearInterval(interval);

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: async (response) => {
          try {
            const apiResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/auth/google`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  idToken: response.credential,
                }),
              },
            );

            const data = await apiResponse.json();

            if (!apiResponse.ok) {
              setMensagem(data.message ?? "Erro ao realizar login");
              return;
            }

            console.log("Usuário autenticado:", data.usuario);

            setMensagem(`Bem-vindo, ${data.usuario.nome}!`);
          } catch {
            setMensagem("Não foi possível conectar com a API");
          }
        },
      });

      const button = document.getElementById("google-login");

      if (button) {
        window.google.accounts.id.renderButton(button, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
        });
      }
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main>
      <h1>Agenda Pet</h1>
      <p>Entre para acessar o sistema.</p>

      <div id="google-login" />

      {mensagem && <p>{mensagem}</p>}
    </main>
  );
}