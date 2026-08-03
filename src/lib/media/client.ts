"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Browser-side Supabase client. Uses the SAME session cookies as the
 * server-side session client, so the admin's login state is one thing shared
 * between server and client. Used only for Storage uploads — every other
 * write goes through a Server Action.
 *
 * `createBrowserClient` is safe to call at module scope: subsequent calls
 * reuse the same instance internally.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
