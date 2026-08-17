import { supabaseUrl } from "./supabase/env";

/**
 * Content-Security-Policy, built once per request (needs a fresh nonce every
 * time — that's why this lives in middleware.ts, not next.config.ts, unlike
 * the other four security headers). Every host below is something the site
 * genuinely loads today, checked against the actual code, not guessed:
 *
 * - Supabase project origin: public site images (content_blocks/team/
 *   carousel render straight from Storage, mediaUrl()) AND the admin's
 *   client-side upload (`src/lib/media/client.ts`, `src/lib/gallery/upload.ts`
 *   — bytes go browser → Supabase directly, never through our server).
 * - challenges.cloudflare.com: Turnstile's script + the iframe it renders
 *   into (`TurnstileWidget.tsx`).
 * - maps.google.com / www.google.com: the click-to-load embed on /kontakt
 *   (`KontaktMap.tsx`) — never loaded until the visitor clicks.
 *
 * `'strict-dynamic'` + the nonce is the real protection (only script tags
 * Next itself placed, or that a nonce'd script inserts, may run); the
 * `https://` host entries alongside it are a fallback for the shrinking set
 * of browsers that don't understand strict-dynamic, per the CSP spec's own
 * recommended pattern.
 *
 * `style-src` allows `'unsafe-inline'` — a deliberate, documented trade-off.
 * The site uses React's `style={{...}}` throughout (this codebase and
 * next/font's injected @font-face both rely on it), and CSP has no practical
 * per-request nonce mechanism for the `style="…"` attribute the way it does
 * for `<script>`. Locking down style-src would mean rewriting every inline
 * style to a CSS Module first — real effort for a much smaller class of risk
 * than script injection, which stays strictly nonced.
 *
 * Development gets two additions PRODUCTION NEVER GETS: `'unsafe-eval'` (the
 * React Fast Refresh runtime evaluates code as a string — without this,
 * `next dev` throws on every load, found the hard way: it silently broke
 * hydration site-wide, not just something CSP-related-looking) and `ws:`/
 * `wss:` in connect-src (the HMR live-reload socket). Both are real
 * weakenings, which is exactly why they're gated to dev only.
 */
export function buildCsp(nonce: string): string {
  const supabaseOrigin = supabaseUrl();
  const isDev = process.env.NODE_ENV === "development";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://challenges.cloudflare.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...(supabaseOrigin ? [supabaseOrigin] : [])],
    "font-src": ["'self'"],
    "connect-src": [
      "'self'",
      "https://challenges.cloudflare.com",
      ...(supabaseOrigin ? [supabaseOrigin] : []),
      ...(isDev ? ["ws:", "wss:"] : []),
    ],
    "frame-src": ["https://challenges.cloudflare.com", "https://maps.google.com", "https://www.google.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
  };

  return Object.entries(directives)
    .map(([key, values]) => (values.length > 0 ? `${key} ${values.join(" ")}` : key))
    .join("; ");
}
