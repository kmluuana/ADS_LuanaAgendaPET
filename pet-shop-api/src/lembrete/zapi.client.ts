import "dotenv/config";

type EnviarMensagemInput = {
  telefone: string;
  mensagem: string;
};

type OmniResponse = {
  messageId?: string;
  code?: string;
  subCode?: string;
  message?: string;
  error?: number | string;
};

function obterConfiguracao() {
  const channelId =
    process.env.OMNI_CHANNEL_ID;

  const secretKey =
    process.env.OMNI_SECRET_KEY;

  if (
    !channelId ||
    !secretKey
  ) {
    throw new Error(
      "Configuração da Z-API Omni não informada",
    );
  }

  return {
    channelId,
    secretKey,
  };
}

function normalizarTelefone(
  telefone: string,
) {
  const numeros =
    telefone.replace(/\D/g, "");

  if (
    numeros.startsWith("55")
  ) {
    return numeros;
  }

  return `55${numeros}`;
}

export async function enviarMensagemWhatsApp(
  input: EnviarMensagemInput,
) {
  const {
    channelId,
    secretKey,
  } = obterConfiguracao();

  const telefone =
    normalizarTelefone(
      input.telefone,
    );

  const url =
    `https://api.omni.z-api.io/v1/channels/${channelId}/messages`;

  const response =
    await fetch(
      url,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${secretKey}`,
        },

        body:
          JSON.stringify({
            recipient: {
              identifier:
                telefone,
            },

            content: {
              type: "TEXT",

              body: {
                message:
                  input.mensagem,
              },
            },
          }),
      },
    );

  const data =
    (await response.json()) as OmniResponse;

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.subCode ||
        data.code ||
        `Erro ao enviar mensagem pela Z-API Omni: ${response.status}`,
    );
  }

  if (!data.messageId) {
    throw new Error(
      "Z-API Omni não retornou o identificador da mensagem",
    );
  }

  return {
    messageId:
      data.messageId,
  };
}