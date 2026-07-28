import { Syne, DM_Sans } from "next/font/google";

/**
 * Self-hosted brand fonts.
 *
 * `next/font/google` downloads these at build time and serves them from our own
 * domain — no request ever goes to Google, so no visitor IP is shared and there
 * is no render-blocking third-party connection (see docs/AUDIT.md §4).
 *
 * These are the SAME typefaces the old site used via a Google Fonts <link>:
 * Syne (display) and DM Sans (body). Weights are exactly the ones the CSS uses
 * — including DM Sans 600/700, which the old <link> forgot to load (the browser
 * faux-bolded them). The unused italic is dropped.
 *
 * Each exposes a CSS variable consumed by src/styles/tokens.css.
 */
export const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
  fallback: ["sans-serif"],
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["sans-serif"],
});
