"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { refreshPublicContent } from "@/lib/admin/revalidate";

export interface Result {
  ok: boolean;
  error?: string;
  id?: string;
}

interface CarouselInput {
  id?: string;
  image_path: string | null;
  alt_de: string | null;
  alt_en: string | null;
  alt_fr: string | null;
  focal_x: number;
  focal_y: number;
  zoom: number;
  visible: boolean;
}

export async function saveCarouselImage(input: CarouselInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (input.id) {
    const { error } = await supabase.from("carousel_images").update(input).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: last } = await supabase
      .from("carousel_images")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (last?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("carousel_images")
      .insert({ ...input, sort_order: nextOrder })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    refreshPublicContent();
    return { ok: true, id: data.id };
  }
  refreshPublicContent();
  return { ok: true };
}

export async function deleteCarouselImage(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("carousel_images").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshPublicContent();
  return { ok: true };
}

export async function reorderCarousel(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("carousel_images")
      .update({ sort_order: i + 1 })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  refreshPublicContent();
  return { ok: true };
}
