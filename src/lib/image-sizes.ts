/**
 * The three WebP sizes every uploaded image gets, shared by the gallery
 * pipeline (`@/lib/gallery`) and the content_blocks/team/carousel pipeline
 * (`@/lib/media`) — one canonical set of numbers instead of two copies that
 * could drift. Matches the brief exactly: thumb 480/q72, medium 1200/q78,
 * large 2000/q80.
 */
export type ImageSize = "thumb" | "medium" | "large";

export const IMAGE_SIZES: readonly ImageSize[] = ["thumb", "medium", "large"];

export interface SizeSpec {
  size: ImageSize;
  /** Longest edge in pixels. */
  maxEdge: number;
  /** WebP quality, 0…1. */
  quality: number;
}

export const SIZE_SPECS: readonly SizeSpec[] = [
  { size: "thumb", maxEdge: 480, quality: 0.72 },
  { size: "medium", maxEdge: 1200, quality: 0.78 },
  { size: "large", maxEdge: 2000, quality: 0.8 },
];

export function isImageSize(value: string): value is ImageSize {
  return (IMAGE_SIZES as readonly string[]).includes(value);
}

/**
 * The three stored paths for one content_blocks/team_members/carousel_images
 * image field. `large` is the pre-existing column (image_path/photo_path);
 * `thumb`/`medium` are new (Phase 7) and null on any row uploaded before
 * this shipped, until re-uploaded.
 */
export interface ImagePaths {
  thumb: string | null;
  medium: string | null;
  large: string | null;
}

/**
 * Build an `ImagePaths` from three flat DB columns — `null` (not an
 * all-null object) when there's no image at all, since `ImageField` and
 * every render site treat any non-null `value`/prop as "an image is set".
 */
export function toImagePaths(
  large: string | null,
  thumb: string | null,
  medium: string | null
): ImagePaths | null {
  return large ? { thumb, medium, large } : null;
}
