/**
 * Sanitise a "where did you want to go?" parameter.
 *
 * The login flow carries a target path through a redirect and an e-mail link.
 * Without this check that parameter would be an open redirect: a link like
 * `/admin/login?weiter=https://example.com` could bounce someone straight off
 * our domain right after they log in. Only our own `/admin` paths are allowed.
 */
export function safeAdminPath(value: FormDataEntryValue | string | null): string | null {
  const raw = typeof value === "string" ? value : null;
  if (!raw) return null;
  // Must be a same-origin path under /admin. `//evil.com` is a protocol-
  // relative URL, not a path — reject it, and reject backslashes too, which
  // some browsers normalise to slashes.
  if (!raw.startsWith("/admin") || raw.startsWith("//") || raw.includes("\\")) return null;
  if (raw.startsWith("/admin/login")) return null;
  return raw;
}
