"use client";

import { parse } from "exifr";
import { pickPhotoYear } from "./year";

/**
 * Read the EXIF `DateTimeOriginal` tag from a photo, if present. Thin wrapper
 * around exifr.
 *
 * Never throws: a corrupt or absent EXIF segment is extremely common (screen-
 * shots, re-saved images, some Android cameras) and just means "fall back to
 * the file date", not an upload failure.
 */
export async function readExifDate(file: File): Promise<Date | null> {
  try {
    const result = await parse(file, { pick: ["DateTimeOriginal"] });
    const value = result?.DateTimeOriginal;
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Staging-time resolution for one file: read its EXIF date, then run the
 * pure cascade in `year.ts`. Called once per file when it's added to the
 * upload queue — the admin can still edit the result before uploading, and
 * the actual upload step (`uploadGalleryPhoto`) takes that final year as a
 * plain number, never touching EXIF itself.
 */
export async function resolvePhotoYear(file: File, currentEditionYear: number): Promise<number> {
  const exifDate = await readExifDate(file);
  return pickPhotoYear({
    exifDate,
    fileLastModified: file.lastModified ? new Date(file.lastModified) : null,
    currentEditionYear,
  });
}
