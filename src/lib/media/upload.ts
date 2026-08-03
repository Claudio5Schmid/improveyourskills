"use client";

import { createSupabaseBrowserClient } from "./client";
import { isSupportedImage, resizeContentImage } from "./resize";

const BUCKET = "media";
const MAX_SOURCE_BYTES = 12 * 1024 * 1024; // 12 MB before compression

export interface UploadedImage {
  /** Object path inside the bucket — this is what goes into content_blocks. */
  path: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Resize a File in the browser, upload it to the `media` bucket, and return
 * the object path. The path shape encodes what the image is for + a random
 * suffix, so the same admin field can replace its image forever without the
 * old file ever colliding.
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

  const resized = await resizeContentImage(file);
  const path = `${sanitisePathSegment(fieldKey) || "unbenannt"}/${filename(file.name)}.webp`;

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, resized.blob, {
    contentType: "image/webp",
    cacheControl: "31536000, immutable",
    upsert: true,
  });
  if (error) throw new Error(`Upload fehlgeschlagen: ${error.message}`);

  return { path, width: resized.width, height: resized.height, bytes: resized.bytes };
}

/** Delete a bucket object. Silent on missing files — the DB may point at nothing. */
export async function deleteMediaObject(path: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove([path]);
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
