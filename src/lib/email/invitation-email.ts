export interface InvitationEmailInput {
  recipientEmail: string;
  tenantName: string;
  roleLabel: string;
  acceptUrl: string;
  inviterName?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Branded uitnodigingsmail voor Het Leerinstituut. */
export function renderInvitationEmail(input: InvitationEmailInput): RenderedEmail {
  const { tenantName, roleLabel, acceptUrl, inviterName } = input;
  const safeTenant = escapeHtml(tenantName);
  const safeRole = escapeHtml(roleLabel);
  const safeUrl = escapeHtml(acceptUrl);
  const intro = inviterName
    ? `${escapeHtml(inviterName)} nodigt je uit voor Het Leerinstituut.`
    : "Je bent uitgenodigd voor Het Leerinstituut.";

  const subject = `Uitnodiging: ${roleLabel} bij ${tenantName}`;

  const html = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Het Leerinstituut</p>
                <h1 style="margin:12px 0 0 0;font-size:24px;line-height:1.25;color:#18181b;">Activeer je toegang</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0 32px;font-size:15px;line-height:1.6;color:#3f3f46;">
                <p style="margin:16px 0 0 0;">${intro}</p>
                <p style="margin:16px 0 0 0;">
                  Je wordt toegevoegd als <strong>${safeRole}</strong> binnen
                  <strong>${safeTenant}</strong>. Je ziet straks alleen gegevens binnen deze schoolomgeving.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <a href="${safeUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 24px;border-radius:10px;">
                  Uitnodiging accepteren
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;font-size:13px;line-height:1.6;color:#71717a;">
                <p style="margin:0;">Werkt de knop niet? Kopieer deze link naar je browser:</p>
                <p style="margin:8px 0 0 0;word-break:break-all;"><a href="${safeUrl}" style="color:#3f3f46;">${safeUrl}</a></p>
                <p style="margin:20px 0 0 0;">Deze uitnodiging verloopt over 7 dagen. Niet verwacht? Dan kun je deze e-mail negeren.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    intro,
    "",
    `Je wordt toegevoegd als ${roleLabel} binnen ${tenantName}.`,
    "",
    "Accepteer je uitnodiging via deze link:",
    acceptUrl,
    "",
    "Deze uitnodiging verloopt over 7 dagen.",
  ].join("\n");

  return { subject, html, text };
}
