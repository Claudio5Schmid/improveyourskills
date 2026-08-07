/**
 * Pure helpers for the gallery's storage layout and size configuration —
 * kept dependency-free so they can be unit-tested without a browser or a
 * Supabase client.
 */

export type PhotoSize = "thumb" | "medium" | "large";

export const PHOTO_SIZES: readonly PhotoSize[] = ["thumb", "medium", "large"];

export interface SizeSpec {
  size: PhotoSize;
  /** Longest edge in pixels. */
  maxEdge: number;
  /** WebP quality, 0…1. */
  quality: number;
}

/** Matches the brief exactly: thumb 480/q72, medium 1200/q78, large 2000/q80. */
export const SIZE_SPECS: readonly SizeSpec[] = [
  { size: "thumb", maxEdge: 480, quality: 0.72 },
  { size: "medium", maxEdge: 1200, quality: 0.78 },
  { size: "large", maxEdge: 2000, quality: 0.8 },
];

export function isPhotoSize(value: string): value is PhotoSize {
  return (PHOTO_SIZES as readonly string[]).includes(value);
}

/** `gallery/{year}/{uuid}_{size}.webp` — exactly the path shape from the brief. */
export function galleryObjectPath(year: number, uuid: string, size: PhotoSize): string {
  return `gallery/${year}/${uuid}_${size}.webp`;
}
