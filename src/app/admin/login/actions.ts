"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { siteOrigin } from "@/lib/site-url";
import { safeAdminPath } from "@/lib/admin/safe-path";

export interface LoginState {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Send a magic link. No passwords exist anywhere in this project (iron rule 2).
 *
 * `shouldCreateUser: false` means an unknown address can never create an
 * account here — even if public sign-up were left switched on in the Supabase
 * dashboard by accident. Being a user is still not enough to get in: the
 * `admins` table decides that (see `getAdminSession`).
 */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Bitte gib eine gültige E-Mail-Adresse ein.", email };
  }

  if (!hasSupabaseEnv()) {
    return {
      status: "error",
      message: "Die Verbindung zur Datenbank ist nicht konfiguriert. Bitte melde dich bei Claudio.",
      email,
    };
  }

  const next = safeAdminPath(formData.get("weiter"));
  const origin = await siteOrigin();
  const callback = new URL("/admin/auth/callback", origin);
  if (next) callback.searchParams.set("weiter", next);

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: callback.toString() },
  });

  if (error) {
    // Too many attempts is the one error worth naming — the person needs to
    // know that waiting helps.
    if (error.status === 429 || /rate limit/i.test(error.message)) {
      return {
        status: "error",
        message: "Zu viele Anfragen. Bitte warte eine Minute und versuche es dann nochmals.",
        email,
      };
    }
    // Everything else (unknown address, sign-up disabled) gets the same neutral
    // answer as success, so this page cannot be used to find out who has an
    // account. The real reason is in the server log.
    console.error("[admin/login] signInWithOtp:", error.message);
  }

  return { status: "sent", email };
}

/** Sign out and go back to the login page. */
export async function logout(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
