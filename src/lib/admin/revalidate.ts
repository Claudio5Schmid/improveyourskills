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
