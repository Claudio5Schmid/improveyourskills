import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Normalise the configured URL to its origin, so a value accidentally pasted
 * with a path (e.g. `https://<ref>.supabase.co/rest/v1/`) still works.
 */
function supabaseOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const match = raw.match(/^https?:\/\/[^/]+/);
  return match ? match[0] : raw;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Anonymous, read-only Supabase client for public content in Server Components.
 * Everything it can reach is gated by RLS (public rows only). The service-role
 * client (for writes / contact form) is added in later phases and never here.
 */
export function createPublicClient(): SupabaseClient {
  return createClient(supabaseOrigin(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
