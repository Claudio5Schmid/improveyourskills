import { unstable_cache } from "next/cache";
import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/server";

export interface GalleryPhoto {
  id: string;
  year: number;
  sortOrder: number;
  blurDataUrl: string | null;
  thumb: { width: number | null; height: number | null };
  medium: { width: number | null; height: number | null };
  large: { width: number | null; height: number | null };
}

interface PhotoRow {
  id: string;
  year: number;
  sort_order: number;
  blur_data_url: string | null;
  width_thumb: number | null;
  height_thumb: number | null;
  width_medium: number | null;
  height_medium: number | null;
  width_large: number | null;
  height_large: number | null;
}

/**
 * Every visible photo, newest year first, `sort_order` within a year. RLS
 * (`gallery_photos: public read visible`) already restricts the anon client
 * to `hidden = false` rows — there is no `hidden` field to check here because
 * a hidden photo simply never arrives in `data`.
 *
 * Resilient like `getSiteContent()`: DB unreachable or unconfigured → empty
 * array, so `/impressionen` renders its empty state instead of crashing.
 */
async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const sb = createPublicClient();
    const { data } = await sb
      .from("gallery_photos")
      .select(
        "id,year,sort_order,blur_data_url,width_thumb,height_thumb,width_medium,height_medium,width_large,height_large"
      )
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true });

    return ((data as PhotoRow[] | null) ?? []).map((row) => ({
      id: row.id,
      year: row.year,
      sortOrder: row.sort_order,
      blurDataUrl: row.blur_data_url,
      thumb: { width: row.width_thumb, height: row.height_thumb },
      medium: { width: row.width_medium, height: row.height_medium },
      large: { width: row.width_large, height: row.height_large },
    }));
  } catch {
    return [];
  }
}

export const getGalleryPhotos = unstable_cache(fetchGalleryPhotos, ["gallery-photos-v1"], {
  revalidate: 300,
  tags: ["gallery"],
});

/** Distinct years that have at least one visible photo, newest first. */
export function galleryYears(photos: GalleryPhoto[]): number[] {
  return [...new Set(photos.map((p) => p.year))].sort((a, b) => b - a);
}
