import { headers } from "next/headers";

/**
 * Cloudflare Web Analytics (Phase 7). Cookieless, aggregated page-view counts
 * — no visitor identification, no cross-site tracking — which is exactly why
 * the site doesn't need a cookie banner (docs/COOKIES.md, messages/*.json
 * datenschutz.cookiesNoBanner).
 *
 * Only rendered from the public `[locale]` layout, never `/admin`'s (that
 * layout doesn't import this component) — organisers' own admin usage isn't
 * what this measures, and the admin is already noindex/private anyway.
 *
 * Skipped outside production so local `next dev`/preview testing never
 * reports fake page views against the real site's numbers.
 *
 * The script tag carries the same per-request nonce Next's own scripts get
 * (`src/middleware.ts` sets it, this reads it back via `headers()`) — it has
 * to, because it's a static tag in our HTML rather than one inserted by an
 * already-trusted script, so `'strict-dynamic'` in the CSP (src/lib/csp.ts)
 * wouldn't trust it on its own.
 */
export default async function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  if (!token || process.env.NODE_ENV !== "production") return null;

  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <script
      nonce={nonce}
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
