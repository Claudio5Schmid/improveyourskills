import { revalidateTag } from "next/cache";

/**
 * All public content is behind one `unstable_cache` tagged "content"
 * (`src/content/content.ts`). Any admin save calls this so the site picks up
 * the change on the very next request instead of waiting for the 5-minute
 * TTL to tick over.
 */
export function refreshPublicContent(): void {
  revalidateTag("content");
}

/**
 * The gallery (`src/lib/gallery/data.ts`) is cached separately from the rest
 * of the content — different table, different admin surface, no reason to
 * invalidate one on every edit of the other.
 */
export function refreshGalleryPhotos(): void {
  revalidateTag("gallery");
}
