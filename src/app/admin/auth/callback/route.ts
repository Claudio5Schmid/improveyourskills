import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/session";
import { safeAdminPath } from "@/lib/admin/safe-path";

/**
 * Where the magic link lands. Supports both shapes a Supabase e-mail link can
 * have, so the login keeps working whichever way the e-mail template is set up:
 *
 *  - `?code=…`        the PKCE flow (default). Safest, but the link must be
 *                     opened in the same browser that requested it, because the
 *                     matching secret sits in a cookie there.
 *  - `?token_hash=…`  the flow you get after changing the "Magic Link" e-mail
 *                     template in the dashboard. Works across devices — you can
 *                     request the link on the laptop and open it on the phone.
 *                     Recommended; the steps are in docs/ADMIN.md.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeAdminPath(searchParams.get("weiter")) ?? "/admin";

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/admin/login?fehler=${reason}`, origin));

  // Supabase itself can report a failure (expired or already-used link).
  if (searchParams.get("error")) {
    console.error("[admin/callback]", searchParams.get("error_description"));
    return fail("link");
  }

  const supabase = await createSessionClient();

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[admin/callback] exchangeCodeForSession:", error.message);
      return fail("link");
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.error("[admin/callback] verifyOtp:", error.message);
      return fail("link");
    }
  } else {
    return fail("link");
  }

  // Logged in — but is this person an admin? A valid Supabase user without a
  // row in `admins` gets nothing, and we drop the session again so no half-
  // logged-in state lingers.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: admin } = user
    ? await supabase.from("admins").select("id").eq("id", user.id).maybeSingle()
    : { data: null };

  if (!admin) {
    await supabase.auth.signOut();
    return fail("kein_admin");
  }

  return NextResponse.redirect(new URL(next, origin));
}
