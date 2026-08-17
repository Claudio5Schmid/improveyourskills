"use client";

import { createSupabaseBrowserClient } from "./client";
import { isSupportedImage, resizeContentImage } from "./resize";
import { IMAGE_SIZES } from "@/lib/image-sizes";

const BUCKET = "media";
const MAX_SOURCE_BYTES = 12 * 1024 * 1024; // 12 MB before compression

export interface UploadedImage {
  /** Object paths inside the bucket — these go into the three image_path_* columns. */
  pathThumb: string;
  pathMedium: string;
  pathLarge: string;
  /** The large variant's dimensions — the only ones anything currently reads. */
  width: number;
  height: number;
  /** Total bytes across all three variants, for error messages/telemetry. */
  bytes: number;
}

/**
 * Resize a File in the browser to all three sizes and upload them to the
 * `media` bucket, returning the three object paths. The path shape encodes
 * what the image is for + a random suffix + the size, so the same admin
 * field can replace its image forever without the old files ever colliding.
 */
export async function uploadContentImage(
  file: File,
  fieldKey: string
): Promise<UploadedImage> {
  if (!isSupportedImage(file)) {
    throw new Error("Nur JPG, PNG oder WebP werden unterstützt.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Das Bild ist grösser als 12 MB. Bitte vorher verkleinern.");
  }

  const variants = await resizeContentImage(file);
  const base = `${sanitisePathSegment(fieldKey) || "unbenannt"}/${filename(file.name)}`;
  const supabase = createSupabaseBrowserClient();

  const paths: Record<string, string> = {};
  let bytes = 0;
  for (const size of IMAGE_SIZES) {
    const variant = variants[size];
    const path = `${base}_${size}.webp`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, variant.blob, {
      contentType: "image/webp",
      cacheControl: "31536000, immutable",
      upsert: true,
    });
    if (error) {
      // Best-effort cleanup of whatever variants already made it up, so a
      // failed upload doesn't leave partial orphans behind (same pattern as
      // the gallery upload).
      await deleteMediaObjects(Object.values(paths));
      throw new Error(`Upload fehlgeschlagen (${size}): ${error.message}`);
    }
    paths[size] = path;
    bytes += variant.bytes;
  }

  const large = variants.large;
  return {
    pathThumb: paths.thumb,
    pathMedium: paths.medium,
    pathLarge: paths.large,
    width: large.width,
    height: large.height,
    bytes,
  };
}

/** Delete bucket objects. Silent on missing files — the DB may point at nothing. */
export async function deleteMediaObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove(paths);
}

// ── helpers ──────────────────────────────────────────────────────────────
function sanitisePathSegment(input: string): string {
  return input
    .toLowerCase()
    .replaceAll(".", "/")
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\/+|\/+$/g, "");
}

function filename(original: string): string {
  const stem = original.replace(/\.[^.]+$/, "").slice(0, 40);
  const safe = sanitisePathSegment(stem).replaceAll("/", "-") || "bild";
  return `${Date.now().toString(36)}-${randomId()}-${safe}`;
}

function randomId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
