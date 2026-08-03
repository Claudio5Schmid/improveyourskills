import type { MetadataRoute } from "next";

/**
 * `/robots.txt`. The public site may be indexed; the admin never.
 * (`/api/foto/` is added in Phase 4 together with the gallery.)
 * The sitemap entry follows in Phase 7 with the rest of the SEO work.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
  };
}
