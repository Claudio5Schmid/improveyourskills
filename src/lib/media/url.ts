import { supabaseUrl } from "@/lib/supabase/env";
import { SIZE_SPECS, type ImagePaths } from "@/lib/image-sizes";

/**
 * Public URL for an image reference stored in the DB.
 *
 * Three shapes are supported so the transition from Phase-1 bundled images to
 * Phase-3 storage-hosted images stays invisible on the public site:
 *
 *   • `null` / empty      → `null`, so callers can render the placeholder.
 *   • `/Bilder/…`         → served straight from `public/` (the seed still
 *                           points here; each file gets replaced individually
 *                           by re-uploading through the admin).
 *   • `https://…`         → returned as-is.
 *   • anything else       → treated as an object path in the `media` bucket
 *                           and rewritten to the public CDN URL.
 *
 * A tiny helper deliberately, not the Supabase JS client — this runs on both
 * the server and the client and must stay dependency-free.
 */
export function mediaUrl(reference: string | null | undefined): string | null {
  if (!reference) return null;
  const ref = reference.trim();
  if (!ref) return null;
  if (ref.startsWith("http://") || ref.startsWith("https://")) return ref;
  if (ref.startsWith("/")) return ref;

  const base = supabaseUrl();
  if (!base) return null;
  return `${base}/storage/v1/object/public/media/${encodePath(ref)}`;
}

/**
 * Build a `srcset` string from up to three stored size variants, e.g.
 * `"…_thumb.webp 480w, …_medium.webp 1200w, …_large.webp 2000w"`. Rows
 * uploaded before Phase 7's multi-size pipeline only have `large` — skips
 * any missing variant, and returns `null` rather than a single-candidate
 * srcset (which buys nothing over the plain `src` every caller already
 * renders as the fallback).
 */
export function mediaSrcSet(paths: ImagePaths): string | null {
  const candidates = SIZE_SPECS.map((spec) => {
    const url = mediaUrl(paths[spec.size]);
    return url ? `${url} ${spec.maxEdge}w` : null;
  }).filter((c): c is string => c !== null);
  return candidates.length >= 2 ? candidates.join(", ") : null;
}

/** True when the reference points at the storage bucket (as opposed to /Bilder). */
export function isStorageMedia(reference: string | null | undefined): boolean {
  if (!reference) return false;
  const ref = reference.trim();
  return Boolean(ref) && !ref.startsWith("/") && !/^https?:\/\//.test(ref);
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}
