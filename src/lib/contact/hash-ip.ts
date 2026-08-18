import { createHmac } from "node:crypto";

/**
 * We never store a raw IP (brief: "IP stored only as a salted hash") — this
 * is a one-way HMAC, not reversible, but stable so the same visitor hashes
 * to the same value for the rate-limit lookup.
 *
 * Deliberately not in ip.ts: that file is `server-only`-guarded (throws
 * outside a Next.js server build), which would make this untestable under
 * plain Vitest. Same split as src/content/format.ts in Phase 3.
 */
export function hashIp(ip: string): string {
  const salt = process.env.CONTACT_IP_HASH_SALT;
  if (!salt) console.error("[contact] CONTACT_IP_HASH_SALT ist nicht gesetzt.");
  return createHmac("sha256", salt || "unsalted-fallback").update(ip).digest("hex");
}
