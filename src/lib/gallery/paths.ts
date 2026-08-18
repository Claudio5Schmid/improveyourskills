/**
 * Pure helpers for the gallery's storage layout and size configuration —
 * kept dependency-free so they can be unit-tested without a browser or a
 * Supabase client.
 *
 * The size type/specs themselves moved to `@/lib/image-sizes` in Phase 7
 * (Performance) so the content_blocks/team/carousel pipeline could reuse the
 * exact same three numbers instead of duplicating them — re-exported here
 * under their original gallery-specific names so nothing else has to change.
 */
import { IMAGE_SIZES, SIZE_SPECS, isImageSize, type ImageSize, type SizeSpec } from "@/lib/image-sizes";

export type PhotoSize = ImageSize;
export const PHOTO_SIZES = IMAGE_SIZES;
export const isPhotoSize = isImageSize;
export type { SizeSpec };
export { SIZE_SPECS };

/** `gallery/{year}/{uuid}_{size}.webp` — exactly the path shape from the brief. */
export function galleryObjectPath(year: number, uuid: string, size: PhotoSize): string {
  return `gallery/${year}/${uuid}_${size}.webp`;
}
