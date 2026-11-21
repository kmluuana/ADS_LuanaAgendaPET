type EnviarMensagemInput = {
  telefone: string;
  mensagem: string;
};

function obterConfiguracao() {
  const instanceId =
    process.env.ZAPI_INSTANCE_ID;

  const token =
    process.env.ZAPI_TOKEN;

  const clientToken =
    process.env.ZAPI_CLIENT_TOKEN;

  if (
    !instanceId ||
    !token ||
    !clientToken
  ) {
    throw new Error(
      "Configuração da Z-API não informada",
    );
  }

  return {
    instanceId,
    token,
    clientToken,
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
    instanceId,
    token,
    clientToken,
  } = obterConfiguracao();

  const telefone =
    normalizarTelefone(
      input.telefone,
    );

  const url =
    `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  const response =
    await fetch(
      url,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "Client-Token":
            clientToken,
        },

        body:
          JSON.stringify({
            phone:
              telefone,

            message:
              input.mensagem,
          }),
      },
    );

  if (!response.ok) {
    const resposta =
      await response.text();

    throw new Error(
      `Erro ao enviar mensagem pela Z-API: ${response.status} ${resposta}`,
    );
  }

  return response.json();
}