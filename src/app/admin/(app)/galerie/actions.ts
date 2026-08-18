"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { refreshGalleryPhotos } from "@/lib/admin/revalidate";
import type { PhotoSize } from "@/lib/gallery/paths";

export interface Result {
  ok: boolean;
  error?: string;
}

export interface NewPhotoInput {
  /** The client-generated UUID used as the storage path prefix — reused as the row's PK. */
  id: string;
  year: number;
  paths: Record<PhotoSize, string>;
  dimensions: Record<PhotoSize, { width: number; height: number }>;
  blurDataUrl: string;
}

/**
 * Persist the DB rows for photos whose bytes are ALREADY in the `gallery`
 * bucket (the browser uploaded them directly under the admin's own session —
 * see `@/lib/gallery/upload`). This action only ever writes `gallery_photos`;
 * if it fails, the caller is responsible for cleaning up the now-orphaned
 * storage objects with `deleteGalleryObjects`.
 */
export async function insertGalleryPhotos(photos: NewPhotoInput[]): Promise<Result> {
  if (photos.length === 0) return { ok: true };

  const { supabase, userId } = await requireAdmin();

  const { data: last } = await supabase
    .from("gallery_photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (last?.sort_order ?? 0) + 1;

  const rows = photos.map((p) => ({
    id: p.id,
    year: p.year,
    sort_order: nextOrder++,
    path_thumb: p.paths.thumb,
    path_medium: p.paths.medium,
    path_large: p.paths.large,
    width_thumb: p.dimensions.thumb.width,
    height_thumb: p.dimensions.thumb.height,
    width_medium: p.dimensions.medium.width,
    height_medium: p.dimensions.medium.height,
    width_large: p.dimensions.large.width,
    height_large: p.dimensions.large.height,
    blur_data_url: p.blurDataUrl,
    uploaded_by: userId,
  }));

  const { error } = await supabase.from("gallery_photos").insert(rows);
  if (error) {
    console.error("[admin/galerie] insert failed:", error);
    return { ok: false, error: "Speichern in der Datenbank fehlgeschlagen." };
  }

  refreshGalleryPhotos();
  return { ok: true };
}

export async function setPhotoHidden(id: string, hidden: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("gallery_photos").update({ hidden }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshGalleryPhotos();
  return { ok: true };
}

/** Repositioning an already-uploaded photo (Block F) — metadata only, the
    three stored WebP files never change. */
export async function setPhotoFocal(
  id: string,
  focal: { focalX: number; focalY: number; zoom: number }
): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("gallery_photos")
    .update({
      focal_x: Math.min(100, Math.max(0, focal.focalX)),
      focal_y: Math.min(100, Math.max(0, focal.focalY)),
      zoom: Math.min(3, Math.max(1, focal.zoom)),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshGalleryPhotos();
  return { ok: true };
}

/** Deletes the DB row AND all three storage objects (brief: delete removes all three files). */
export async function deleteGalleryPhoto(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();

  const { data: row } = await supabase
    .from("gallery_photos")
    .select("path_thumb,path_medium,path_large")
    .eq("id", id)
    .maybeSingle();

  if (row) {
    const paths = [row.path_thumb, row.path_medium, row.path_large].filter(
      (p): p is string => Boolean(p)
    );
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from("gallery").remove(paths);
      // Not fatal: an already-missing object shouldn't block deleting the DB
      // row, but it's worth a server log if it ever happens unexpectedly.
      if (storageError) console.error("[admin/galerie] storage remove:", storageError.message);
    }
  }

  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  refreshGalleryPhotos();
  return { ok: true };
}

/** Rewrite sort_order for one year's photos, top → bottom as dragged. */
export async function reorderGalleryYear(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("gallery_photos")
      .update({ sort_order: i + 1 })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  refreshGalleryPhotos();
  return { ok: true };
}
