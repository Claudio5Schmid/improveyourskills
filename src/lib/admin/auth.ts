import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/session";

export const LOGIN_PATH = "/admin/login";

export interface AdminSession {
  /** The signed-in admin's client — every write goes through it (RLS applies). */
  supabase: SupabaseClient;
  userId: string;
  email: string;
  displayName: string;
}

/**
 * The single gate for everything under `/admin`.
 *
 * Two separate checks, because they answer two different questions:
 *  1. `getUser()` — is this a real, currently valid session? (verified against
 *     the Supabase auth server, not just a decoded cookie)
 *  2. a row in `admins` — is this user allowed in at all? Being able to log in
 *     is not the same as being an admin.
 *
 * Called by the admin layout AND again by every Server Action. The layout check
 * alone would not be enough: Server Actions are their own HTTP endpoints and
 * are not protected by whatever rendered the page.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSessionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!admin) return null;

  return {
    supabase,
    userId: user.id,
    email: user.email ?? "",
    displayName: admin.display_name || (user.email ?? ""),
  };
}

/** Same, but redirects to the login page instead of returning null. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}
