import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /**
   * Permanent (301) redirects from the old hand-written .html URLs to the new
   * clean routes. Kept in next.config so they survive any hosting change
   * (brief Phase 1.3). The old site was German-only, so each maps to the
   * unprefixed German route.
   */
  async redirects() {
    // statusCode: 301 (not `permanent: true`, which Next emits as 308) to match
    // the brief. These are GET page moves, so 301 is the right, traditional code.
    return [
      { source: "/index.html", destination: "/", statusCode: 301 },
      { source: "/ueber.html", destination: "/ueber-uns", statusCode: 301 },
      { source: "/impressionen.html", destination: "/impressionen", statusCode: 301 },
      { source: "/kontakt.html", destination: "/kontakt", statusCode: 301 },
      { source: "/anmeldung.html", destination: "/anmeldung", statusCode: 301 },
      { source: "/impressum.html", destination: "/impressum", statusCode: 301 },
    ];
  },

  /**
   * Security headers (brief Phase 7 §Livegang). Four of the five live here,
   * static, on every route — the fifth, Content-Security-Policy, needs a
   * fresh nonce per request and is set in `src/middleware.ts` instead (see
   * `src/lib/csp.ts` for why and what it allows).
   *
   * Keep the admin out of search engines. The `<meta name="robots">` tag in
   * the admin layout says the same thing, but a header also covers responses
   * that are not HTML pages (redirects, route handlers) — and it cannot be
   * lost in a refactor of the layout.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // HTTPS only, for this domain's subdomains too. No `preload` yet —
          // that's a near-irreversible commitment (submitted to browsers'
          // built-in list) that should wait for Claudio's explicit go-ahead,
          // once the real domain is live and stable (docs/DNS-HOSTPOINT.md).
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing on this site uses any of these browser features.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
