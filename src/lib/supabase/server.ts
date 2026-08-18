import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

export { hasSupabaseEnv } from "./env";

/**
 * Anonymous, read-only Supabase client for public content in Server Components.
 * Everything it can reach is gated by RLS (public rows only).
 *
 * Admin writes do NOT use this client — they use the signed-in admin's own
 * session (`./session`), so RLS still applies to every write.
 */
export function createPublicClient(): SupabaseClient {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
