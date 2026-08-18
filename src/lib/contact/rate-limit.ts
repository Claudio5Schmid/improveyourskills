import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Generous enough for a genuine visitor (e.g. fixing a typo), tight for a flood. */
export const RATE_LIMIT_WINDOW_MINUTES = 60;
export const RATE_LIMIT_MAX_PER_WINDOW = 3;

/**
 * `contact_messages` doubles as the rate-limit store — no separate
 * infrastructure (Redis/KV) for a form that gets a handful of submissions a
 * week. Fails OPEN: a DB hiccup here should never block a real visitor from
 * reaching out, and the worst case is a few extra spam rows during a rare
 * outage window.
 */
export async function isRateLimited(supabase: SupabaseClient, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (error) {
    console.error("[contact] Rate-Limit-Abfrage fehlgeschlagen:", error.message);
    return false;
  }
  return (count ?? 0) >= RATE_LIMIT_MAX_PER_WINDOW;
}
