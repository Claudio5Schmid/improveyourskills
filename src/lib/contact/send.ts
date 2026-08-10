import "server-only";

import { Resend } from "resend";
import { renderNotificationEmail, renderAutoReplyEmail, type NotificationEmailInput } from "./email-templates";

// Resend's own shared test sender — works with no domain verification, but
// only Resend account owners can receive at it. Real deployments must set
// RESEND_FROM_EMAIL once the domain is verified (docs/RESEND.md).
const FALLBACK_FROM = "Improve your skills <onboarding@resend.dev>";

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || FALLBACK_FROM;
}

/**
 * Sends both the notification to the admin recipient and the visitor's
 * auto-reply. Returns whether BOTH went out — the brief only gives us one
 * `email_delivery_status` per message, and a visitor who never got their
 * confirmation is worth flagging too, even if the admin's copy arrived fine.
 * Never throws: a missing env var or a Resend outage must not stop the
 * message from being saved (brief — see actions.ts).
 */
export async function sendContactEmails(input: NotificationEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY ist nicht gesetzt — E-Mail-Versand übersprungen.");
    return false;
  }
  // No fallback here on purpose — unlike the sender address, a wrong or
  // stale default recipient would silently misroute every contact-form
  // notification. Fail loudly and skip sending instead.
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();
  if (!toEmail) {
    console.error("[contact] CONTACT_TO_EMAIL ist nicht gesetzt — E-Mail-Versand übersprungen.");
    return false;
  }
  const resend = new Resend(apiKey);

  const notification = renderNotificationEmail(input);
  const autoReply = renderAutoReplyEmail(input.firstName, input.locale);

  const [notifyResult, replyResult] = await Promise.allSettled([
    resend.emails.send({
      from: fromAddress(),
      to: toEmail,
      replyTo: input.email,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    }),
    resend.emails.send({
      from: fromAddress(),
      to: input.email,
      subject: autoReply.subject,
      html: autoReply.html,
      text: autoReply.text,
    }),
  ]);

  let ok = true;
  if (notifyResult.status === "rejected" || notifyResult.value.error) {
    console.error(
      "[contact] Benachrichtigung an Pascal fehlgeschlagen:",
      notifyResult.status === "rejected" ? notifyResult.reason : notifyResult.value.error
    );
    ok = false;
  }
  if (replyResult.status === "rejected" || replyResult.value.error) {
    console.error(
      "[contact] Automatische Antwort an die Besucherin fehlgeschlagen:",
      replyResult.status === "rejected" ? replyResult.reason : replyResult.value.error
    );
    ok = false;
  }
  return ok;
}
