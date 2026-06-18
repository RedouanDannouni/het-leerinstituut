const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Overschrijft de standaard afzender (RESEND_FROM). */
  from?: string;
  replyTo?: string;
}

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function getFrom(explicit?: string): string {
  const from = explicit ?? process.env.RESEND_FROM;
  if (!from) {
    throw new Error(
      "RESEND_FROM ontbreekt. Zet bijv. RESEND_FROM=\"Het Leerinstituut <uitnodigingen@menturo.app>\".",
    );
  }
  return from;
}

/**
 * Verstuurt een e-mail via de Resend REST API. Bewust fetch-based zodat er
 * geen extra dependency nodig is en het in elke server-runtime werkt.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY ontbreekt in de omgeving." };
  }

  let response: Response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFrom(input.from),
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
  } catch (cause) {
    return { ok: false, error: `Netwerkfout bij Resend: ${(cause as Error).message}` };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ?? `Resend gaf status ${response.status}.`;
    return { ok: false, error: message };
  }

  const id = (data as { id?: string } | null)?.id;
  if (!id) {
    return { ok: false, error: "Resend gaf geen bericht-id terug." };
  }

  return { ok: true, id };
}
