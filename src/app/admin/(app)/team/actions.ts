"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { refreshPublicContent } from "@/lib/admin/revalidate";

export interface Result {
  ok: boolean;
  error?: string;
  id?: string;
}

interface TeamInput {
  id?: string;
  name: string;
  role_de: string | null;
  role_en: string | null;
  role_fr: string | null;
  extra_de: string | null;
  extra_en: string | null;
  extra_fr: string | null;
  photo_path: string | null;
  focal_x: number;
  focal_y: number;
  zoom: number;
  visible: boolean;
}

/**
 * Insert-or-update one team member.
 *
 * `visible` is what the public read policy checks (`team_members: public read
 * visible`), so hiding a row is enough — no delete needed for a temporary
 * takedown. Delete is a separate action, exposed with a confirmation dialog.
 */
export async function saveTeamMember(input: TeamInput): Promise<Result> {
  if (!input.name.trim()) return { ok: false, error: "Name ist Pflicht." };

  const { supabase, userId } = await requireAdmin();

  const payload = {
    ...input,
    name: input.name.trim(),
    // updated_by for team_members exists only on content_blocks/site_settings,
    // so we don't set one here — the record's own `created_at` is enough.
  };
  void userId;

  if (input.id) {
    const { error } = await supabase.from("team_members").update(payload).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    // Append to the end.
    const { data: last } = await supabase
      .from("team_members")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (last?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("team_members")
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

export async function deleteTeamMember(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshPublicContent();
  return { ok: true };
}

/** Persist a new order. `ids` is the desired order (top → bottom). */
export async function reorderTeam(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  // sort_order values are 1-based to match the seed. Upsert would need every
  // NOT NULL column filled, so per-row UPDATE is simpler — this list is at
  // most a handful of people.
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("team_members")
      .update({ sort_order: i + 1 })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  refreshPublicContent();
  return { ok: true };
}
