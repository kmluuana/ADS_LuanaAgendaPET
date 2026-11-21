
type EnviarMensagemInput = {
  telefone: string;
  mensagem: string;
};

type RespostaOmni = {
  messageId: string;
};

export type TipoErroZApi =
  | "CONFIGURACAO"
  | "VALIDACAO"
  | "REJEITADO"
  | "INCERTO";

export class ErroZApi extends Error {
  constructor(
    message: string,
    public readonly tipo: TipoErroZApi,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ErroZApi";
  }
}

const TIMEOUT_MS = 15_000;

function obterConfiguracao() {
  const channelId = process.env.OMNI_CHANNEL_ID;
  const secretKey = process.env.OMNI_SECRET_KEY;

  if (!channelId || !secretKey) {
    throw new ErroZApi(
      "Configuração da Z-API Omni não informada",
      "CONFIGURACAO",
    );
  }

  return { channelId, secretKey };
}

function normalizarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, "");

  const numeroBrasil = numeros.startsWith("55")
    ? numeros.slice(2)
    : numeros;

  if (!/^[1-9][0-9]\d{8,9}$/.test(numeroBrasil)) {
    throw new ErroZApi(
      "Telefone brasileiro inválido",
      "VALIDACAO",
    );
  }

  return `55${numeroBrasil}`;
}

export async function enviarMensagemWhatsApp(
  input: EnviarMensagemInput,
): Promise<RespostaOmni> {
  const telefone = normalizarTelefone(input.telefone);

  if (!input.mensagem.trim()) {
    throw new ErroZApi(
      "A mensagem não pode estar vazia",
      "VALIDACAO",
    );
  }

  const { channelId, secretKey } = obterConfiguracao();

  const url =
    `https://api.omni.z-api.io/v1/channels/` +
    `${encodeURIComponent(channelId)}/messages`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },

      body: JSON.stringify({
        recipient: {
          identifier: telefone,
        },
        content: {
          type: "TEXT",
          body: {
            message: input.mensagem,
          },
        },
      }),

      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ErroZApi(
      "Falha de comunicação ou timeout na Omni. " +
        "O resultado do envio é desconhecido.",
      "INCERTO",
    );
  }

  if (!response.ok) {
    const rejeicaoDefinitiva =
      response.status >= 400 &&
      response.status < 500 &&
      ![408, 409, 425, 429].includes(response.status);

    throw new ErroZApi(
      `Omni retornou HTTP ${response.status}`,
      rejeicaoDefinitiva ? "REJEITADO" : "INCERTO",
      response.status,
    );
  }

  let resultado: unknown;

  try {
    resultado = await response.json();
  } catch {
    throw new ErroZApi(
      "A Omni aceitou a requisição, mas retornou JSON inválido",
      "INCERTO",
    );
  }

  if (
    typeof resultado !== "object" ||
    resultado === null ||
    !("messageId" in resultado) ||
    typeof resultado.messageId !== "string" ||
    !resultado.messageId.trim()
  ) {
    throw new ErroZApi(
      "Resposta da Omni sem identificador de mensagem",
      "INCERTO",
    );
  }

  return {
    messageId: resultado.messageId,
  };
}
