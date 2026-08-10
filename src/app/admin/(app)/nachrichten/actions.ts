"use server";

import { requireAdmin } from "@/lib/admin/auth";

export interface Result {
  ok: boolean;
  error?: string;
}

export async function setMessageRead(id: string, read: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("contact_messages")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
