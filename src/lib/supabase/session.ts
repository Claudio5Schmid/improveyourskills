import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Supabase client bound to the visitor's cookies — this is the *signed-in
 * admin's* client, used in Server Components, Route Handlers and Server
 * Actions under `/admin`.
 *
 * Deliberately NOT the service-role key: every admin write goes through this
 * client, so the RLS policies from Phase 2 (`is_admin()`) are enforced by the
 * database on every single statement. A bug in our code can therefore never
 * write more than a logged-in admin is allowed to write. The service-role key
 * stays reserved for things RLS cannot express (contact form insert, Phase 5).
 */
export async function createSessionClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Harmless: the middleware refreshes the session cookies instead.
        }
      },
    },
  });
}
