/**
 * Plain HTML email templates — no React Email, matches how this project
 * already hand-writes the (Supabase-dashboard-configured) magic-link email.
 * Custom web fonts don't render reliably across email clients, so the brand
 * comes through as colour + a bold system-font stack rather than Syne itself.
 *
 * No `server-only` guard: unlike send.ts, nothing here touches a secret or a
 * server-only API — it's pure string building, and staying plain keeps it
 * unit-testable (see email-templates.test.ts).
 */

const GREEN_DARK = "#102C26";
const CREAM = "#F7E7CE";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f4ede1;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:${GREEN_DARK};padding:28px 32px;">
                <span style="font-size:20px;font-weight:700;letter-spacing:0.03em;color:${CREAM};">Improve your skills</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f7f4ee;color:#7a7a7a;font-size:12px;">
                Improve your skills · Skill-Training für Floorball · Uster
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface NotificationEmailInput {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  locale: "de" | "en" | "fr";
}

/** To pascal.schmuki@bluewin.ch — always German, this is an internal admin-facing email. */
export function renderNotificationEmail(input: NotificationEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const name = `${input.firstName} ${input.lastName}`;
  const subject = `Neue Anfrage von ${name}`;
  const messageHtml = escapeHtml(input.message).replace(/\n/g, "<br />");

  const html = shell(`
    <p style="margin:0 0 16px;">Neue Nachricht über das Kontaktformular:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
      <tr><td style="padding:4px 0;color:#7a7a7a;width:90px;">Von</td><td style="padding:4px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#7a7a7a;">E-Mail</td><td style="padding:4px 0;">${escapeHtml(input.email)}</td></tr>
      <tr><td style="padding:4px 0;color:#7a7a7a;">Sprache</td><td style="padding:4px 0;">${input.locale}</td></tr>
    </table>
    <p style="margin:0 0 8px;color:#7a7a7a;">Nachricht</p>
    <p style="margin:0;padding:16px;background:#f7f4ee;border-radius:12px;">${messageHtml}</p>
    <p style="margin:24px 0 0;font-size:13px;color:#7a7a7a;">Antworten geht direkt per Reply — die Antwort geht an ${escapeHtml(input.email)}.</p>
  `);

  const text = `Neue Anfrage von ${name}\nE-Mail: ${input.email}\nSprache: ${input.locale}\n\n${input.message}`;

  return { subject, html, text };
}

const AUTO_REPLY_COPY = {
  de: {
    subject: (firstName: string) => `Danke für deine Nachricht, ${firstName}!`,
    greeting: (firstName: string) => `Hallo ${firstName}`,
    body: "Danke für deine Nachricht an Improve your skills. Wir melden uns so schnell wie möglich bei dir.",
    signoff: "Sportliche Grüsse<br />Das Team von Improve your skills",
  },
  en: {
    subject: (firstName: string) => `Thanks for your message, ${firstName}!`,
    greeting: (firstName: string) => `Hi ${firstName}`,
    body: "Thanks for reaching out to Improve your skills. We'll get back to you as soon as we can.",
    signoff: "Best,<br />The Improve your skills team",
  },
  fr: {
    subject: (firstName: string) => `Merci pour ton message, ${firstName} !`,
    greeting: (firstName: string) => `Bonjour ${firstName}`,
    body: "Merci d'avoir contacté Improve your skills. Nous te répondrons dès que possible.",
    signoff: "Sportivement,<br />L'équipe Improve your skills",
  },
} as const;

/** To the visitor, in their own language. */
export function renderAutoReplyEmail(
  firstName: string,
  locale: "de" | "en" | "fr"
): { subject: string; html: string; text: string } {
  const copy = AUTO_REPLY_COPY[locale];
  const safeFirstName = escapeHtml(firstName);

  const html = shell(`
    <p style="margin:0 0 16px;">${copy.greeting(safeFirstName)}</p>
    <p style="margin:0 0 24px;">${copy.body}</p>
    <p style="margin:0;">${copy.signoff}</p>
  `);

  const text = `${copy.greeting(firstName)}\n\n${copy.body}\n\n${copy.signoff.replace(/<br \/>/g, "\n")}`;

  return { subject: copy.subject(firstName), html, text };
}
