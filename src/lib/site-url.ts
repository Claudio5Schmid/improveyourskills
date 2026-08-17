import { headers } from "next/headers";

function normalize(url: string): string {
  return url.replace(/\/+$/, "");
}

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
  if (configured && /^https?:\/\//.test(configured)) return normalize(configured);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Synchronous counterpart for metadata files (`generateMetadata`, `sitemap.ts`,
 * `robots.ts`, `opengraph-image.tsx`) — these cannot call `headers()` (some
 * are statically generated), so this reads only environment, never the
 * request. Priority: `NEXT_PUBLIC_SITE_URL` (set this in Vercel once the real
 * domain is live — see docs/VERCEL.md) → Vercel's own preview URL → the real
 * domain as an always-correct-eventually default (dev falls back to
 * localhost so links are clickable while running `npm run dev`).
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//.test(configured)) return normalize(configured);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return "https://www.improveyourskills.ch";
}
