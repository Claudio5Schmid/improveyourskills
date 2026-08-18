import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * `/robots.txt`. The public site may be indexed; the admin never, and
 * `/api/foto/` (Phase 4's private-bucket photo route) never — its own
 * X-Robots-Tag header already says so per-response, this is the second layer.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/foto/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
