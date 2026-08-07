import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * Service-role Supabase client — bypasses RLS entirely. `import "server-only"`
 * makes any accidental import from a Client Component a build error instead
 * of a runtime surprise.
 *
 * This is deliberately NOT how admin writes work in this project (those use
 * the signed-in admin's own session — see `./session.ts` — so RLS still
 * gates every statement). The service-role key is reserved for the one
 * thing RLS genuinely cannot express: letting an anonymous VISITOR read
 * bytes out of the private `gallery` bucket, gated by a `hidden` flag that
 * lives in a different table than the storage object itself
 * (`/api/foto/[id]/[size]`, Phase 4).
 *
 * Throws loudly if the key is missing rather than silently falling back to
 * the anon client — a route that's supposed to bypass RLS must never
 * quietly start running as anon instead.
 */
export function createServiceRoleClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt — die Foto-Route kann ohne diesen " +
        "Schlüssel keine privaten Bilder ausliefern."
    );
  }
  return createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
