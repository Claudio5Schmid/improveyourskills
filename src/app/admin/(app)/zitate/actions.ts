"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { refreshPublicContent } from "@/lib/admin/revalidate";

export interface Result {
  ok: boolean;
  error?: string;
  id?: string;
}

// ── Testimonials ──────────────────────────────────────────────────────────

interface TestimonialInput {
  id?: string;
  quote_de: string | null;
  quote_en: string | null;
  quote_fr: string | null;
  author_name: string | null;
  author_role_de: string | null;
  author_role_en: string | null;
  author_role_fr: string | null;
  visible: boolean;
}

export async function saveTestimonial(input: TestimonialInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (input.id) {
    const { error } = await supabase.from("testimonials").update(input).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: last } = await supabase
      .from("testimonials")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (last?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("testimonials")
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

export async function deleteTestimonial(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshPublicContent();
  return { ok: true };
}

export async function reorderTestimonials(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("testimonials")
      .update({ sort_order: i + 1 })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  refreshPublicContent();
  return { ok: true };
}

// ── Stats ─────────────────────────────────────────────────────────────────

interface StatInput {
  id?: string;
  value: string;
  label_de: string | null;
  label_en: string | null;
  label_fr: string | null;
  visible: boolean;
}

export async function saveStat(input: StatInput): Promise<Result> {
  if (!input.value.trim()) return { ok: false, error: "Wert ist Pflicht." };
  const { supabase } = await requireAdmin();
  if (input.id) {
    const { error } = await supabase.from("stats").update(input).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: last } = await supabase
      .from("stats")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (last?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("stats")
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

export async function deleteStat(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("stats").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshPublicContent();
  return { ok: true };
}

export async function reorderStats(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("stats")
      .update({ sort_order: i + 1 })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  refreshPublicContent();
  return { ok: true };
}
