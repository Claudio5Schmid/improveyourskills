import { defineRouting } from "next-intl/routing";

/**
 * Locale routing for the site.
 *
 * - `de` is the default and is served WITHOUT a prefix (`/`, `/kontakt`, …).
 * - `en` and `fr` live under `/en/…` and `/fr/…`.
 *
 * `localePrefix: "as-needed"` is exactly that behaviour: the default locale has
 * no prefix, the others do. EN/FR are currently verbatim German copies and are
 * a nice-to-have (see docs/PLAN.md); the infrastructure is in place so real
 * translations can be dropped in later without touching routing.
 */
export const routing = defineRouting({
  locales: ["de", "en", "fr"],
  defaultLocale: "de",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
