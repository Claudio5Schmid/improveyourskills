import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-side half of Turnstile — the widget in the browser only proves a
 * token was issued, this call proves it to Cloudflare and that it hasn't
 * been reused. Never trust the token on its own.
 */
export async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[contact] TURNSTILE_SECRET_KEY ist nicht gesetzt.");
    return false;
  }

  const body = new URLSearchParams({ secret, response: token, remoteip: remoteIp });

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[contact] Turnstile-Verifikation fehlgeschlagen:", err);
    return false;
  }
}
