import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { getPathname } from "@/i18n/navigation";
import { INDEXABLE_LOCALES } from "@/lib/seo";
import { getGalleryPhotos, galleryYears } from "@/lib/gallery/data";

const ROUTES: {
  pathname: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}[] = [
  { pathname: "/", changeFrequency: "weekly", priority: 1 },
  { pathname: "/ueber-uns", changeFrequency: "monthly", priority: 0.7 },
  { pathname: "/impressionen", changeFrequency: "weekly", priority: 0.6 },
  { pathname: "/kontakt", changeFrequency: "yearly", priority: 0.5 },
  { pathname: "/anmeldung", changeFrequency: "weekly", priority: 0.8 },
  { pathname: "/impressum", changeFrequency: "yearly", priority: 0.1 },
  { pathname: "/datenschutz", changeFrequency: "yearly", priority: 0.1 },
];

/**
 * `fr` is excluded here for the same reason as INDEXABLE_LOCALES itself
 * (src/lib/seo.ts) — it's still an untranslated German copy, listing it
 * would tell Google it's real French content.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    const languages: Record<string, string> = {};
    for (const l of INDEXABLE_LOCALES) {
      languages[l] = `${base}${getPathname({ locale: l, href: route.pathname })}`;
    }
    for (const locale of INDEXABLE_LOCALES) {
      entries.push({
        url: `${base}${getPathname({ locale, href: route.pathname })}`,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages },
      });
    }
  }

  // Each gallery year is its own crawlable view (?jahr=…), same as a page.
  const photos = await getGalleryPhotos();
  for (const year of galleryYears(photos)) {
    for (const locale of INDEXABLE_LOCALES) {
      entries.push({
        url: `${base}${getPathname({ locale, href: "/impressionen" })}?jahr=${year}`,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
