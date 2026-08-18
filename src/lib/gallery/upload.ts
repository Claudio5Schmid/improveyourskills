"use client";

import { createSupabaseBrowserClient } from "@/lib/media/client";
import { processGalleryPhoto } from "./resize";
import { galleryObjectPath, PHOTO_SIZES, type PhotoSize } from "./paths";

const BUCKET = "gallery";
const MAX_SOURCE_BYTES = 25 * 1024 * 1024; // room for real camera/phone originals
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export interface UploadedPhoto {
  /** Client-generated UUID — the shared id across all three object paths. */
  id: string;
  year: number;
  paths: Record<PhotoSize, string>;
  dimensions: Record<PhotoSize, { width: number; height: number }>;
  blurDataUrl: string;
  /** Total bytes across all three variants, for the admin's upload summary. */
  bytes: number;
}

export interface UploadPhotoOptions {
  /** Already resolved during staging (EXIF/mtime cascade or a manual edit). */
  year: number;
  /**
   * Coarse 0..1 progress. The Supabase JS client uploads via fetch, which has
   * no byte-level progress events in the browser — so this reports discrete
   * steps (resized → thumb uploaded → medium uploaded → large uploaded)
   * rather than a smooth byte counter. Good enough to show real movement
   * across 30 files without a bespoke XHR upload path.
   */
  onProgress?: (fraction: number) => void;
}

export function isSupportedPhoto(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type);
}

/**
 * Resize one File to all three gallery variants and upload them to the
 * private `gallery` bucket under the admin's own session (RLS: "gallery:
 * admin insert"). Returns everything the caller needs to insert the
 * `gallery_photos` row — this function never touches the database itself.
 */
export async function uploadGalleryPhoto(
  file: File,
  options: UploadPhotoOptions
): Promise<UploadedPhoto> {
  if (!isSupportedPhoto(file)) {
    throw new Error("Nur JPG, PNG, WebP oder HEIC werden unterstützt.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Die Datei ist grösser als 25 MB.");
  }

  const processed = await processGalleryPhoto(file);
  options.onProgress?.(0.25);

  const id = crypto.randomUUID();
  const supabase = createSupabaseBrowserClient();

  const paths = {} as Record<PhotoSize, string>;
  const dimensions = {} as Record<PhotoSize, { width: number; height: number }>;
  let bytes = 0;
  let done = 0;

  for (const size of PHOTO_SIZES) {
    const variant = processed.variants[size];
    const path = galleryObjectPath(options.year, id, size);
    const { error } = await supabase.storage.from(BUCKET).upload(path, variant.blob, {
      contentType: "image/webp",
      cacheControl: "31536000, immutable",
      // id is a fresh UUID for every upload — a collision would mean a real
      // bug, so let it fail loudly instead of silently overwriting.
      upsert: false,
    });
    if (error) {
      // Best-effort cleanup of whatever variants already made it up, so a
      // failed upload doesn't leave partial orphans behind.
      await deleteGalleryObjects(Object.values(paths));
      throw new Error(`Hochladen fehlgeschlagen (${size}): ${error.message}`);
    }
    paths[size] = path;
    dimensions[size] = { width: variant.width, height: variant.height };
    bytes += variant.bytes;
    done++;
    options.onProgress?.(0.25 + 0.75 * (done / PHOTO_SIZES.length));
  }

  return { id, year: options.year, paths, dimensions, blurDataUrl: processed.blurDataUrl, bytes };
}

/** Remove storage objects (all three variants of one photo, or a batch). */
export async function deleteGalleryObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove(paths);
}
