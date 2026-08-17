import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { siteUrl } from "./site-url";

export const BRAND = "Improve your skills";

/**
 * Locales with real, reviewed content. `fr` is deliberately excluded — it is
 * still a byte-for-byte German copy (see messages/fr.json / docs/PLAN.md),
 * so listing it in hreflang or the sitemap would tell Google it's a French
 * translation when it isn't (duplicate-content risk). Move it here once real
 * French copy lands; nothing else needs to change.
 */
export const INDEXABLE_LOCALES: Locale[] = ["de", "en"];

interface PageMetaInput {
  locale: Locale;
  /** Internal (unprefixed) pathname, e.g. "/" or "/kontakt". */
  pathname: string;
  /** Short title WITHOUT the brand suffix — the root layout's title template adds it. */
  title: string;
  description: string;
  robots?: Metadata["robots"];
}

/**
 * Builds title/description/canonical/hreflang/OG/Twitter for one page in one
 * locale. Centralised so all 7 public pages produce consistent, correct
 * metadata instead of 7 slightly-different hand-rolled versions.
 */
export function pageMetadata({ locale, pathname, title, description, robots }: PageMetaInput): Metadata {
  const base = siteUrl();

  const languages: Record<string, string> = {};
  for (const l of INDEXABLE_LOCALES) {
    languages[l] = `${base}${getPathname({ locale: l, href: pathname })}`;
  }
  languages["x-default"] = languages[String("de" satisfies Locale)];

  const url = `${base}${getPathname({ locale, href: pathname })}`;
  const fullTitle = `${title} · ${BRAND}`;

  return {
    // Short title — the root layout's title.template appends " · BRAND" for
    // every route EXCEPT "/" itself (see the home page's generateMetadata,
    // which overrides this with an absolute title instead).
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: BRAND,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(robots ? { robots } : {}),
  };
}
