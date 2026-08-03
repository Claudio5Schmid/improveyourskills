/**
 * Supabase environment access, in one place.
 *
 * The URL is normalised to its origin, so a value accidentally pasted with a
 * path (e.g. `https://<ref>.supabase.co/rest/v1/`) still works — that exact
 * mistake cost us an afternoon in Phase 2.
 */

export function supabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const match = raw.match(/^https?:\/\/[^/]+/);
  return match ? match[0] : raw;
}

export function supabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}
