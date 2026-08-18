import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/BrandMark";

/**
 * Lives under [locale], not at the app root next to icon.svg — has to.
 * `icon.svg` is a static file with a `.svg` in its URL, so next-intl's
 * middleware (which skips any path containing a dot) never touches it. This
 * file resolves to an extension-less URL (`/apple-icon`), so the middleware
 * rewrites it to `/de/apple-icon` like any other page — and 404s unless a
 * route actually exists there. Same reasoning already applies to
 * opengraph-image.tsx next door.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandMark box={180} />, size);
}
