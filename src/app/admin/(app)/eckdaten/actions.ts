"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { isFactIconKey } from "@/lib/facts-icons";

export interface Result {
  ok: boolean;
  error?: string;
  id?: string;
}

interface FactInput {
  id?: string;
  icon: string;
  label_de: string;
  label_en: string | null;
  label_fr: string | null;
  status: "set" | "open" | "soon";
  value_de: string | null;
  value_en: string | null;
  value_fr: string | null;
  visible: boolean;
}

export async function saveFact(input: FactInput): Promise<Result> {
  if (!input.label_de.trim()) return { ok: false, error: "Label (DE) ist Pflicht." };
  if (!isFactIconKey(input.icon)) return { ok: false, error: "Ungültiges Icon." };

  const { supabase } = await requireAdmin();
  const payload = { ...input, label_de: input.label_de.trim() };

  if (input.id) {
    const { error } = await supabase.from("home_facts").update(payload).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: last } = await supabase
      .from("home_facts")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (last?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("home_facts")
      .insert({ ...payload, sort_order: nextOrder })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    refreshPublicContent();
    return { ok: true, id: data.id };
  }

  refreshPublicContent();
  return { ok: true };
}

export async function deleteFact(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("home_facts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshPublicContent();
  return { ok: true };
}

export async function reorderFacts(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("home_facts")
      .update({ sort_order: i + 1 })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  refreshPublicContent();
  return { ok: true };
}
