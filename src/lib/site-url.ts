import { headers } from "next/headers";

/**
 * Absolute origin of the current deployment, e.g. `https://…vercel.app`.
 *
 * Needed for the magic-link redirect, which must be an absolute URL. Prefers
 * the configured canonical URL and falls back to the request's own host, so
 * logging in works on a preview deployment and on localhost without extra
 * configuration.
 */
export async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//.test(configured)) return configured.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
