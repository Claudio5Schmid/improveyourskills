"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { parseContactForm, type ContactFormFieldErrors } from "@/lib/contact/schema";
import { verifyTurnstile } from "@/lib/contact/turnstile";
import { clientIp, hashIp } from "@/lib/contact/ip";
import { isRateLimited } from "@/lib/contact/rate-limit";
import { sendContactEmails } from "@/lib/contact/send";

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export interface ContactFormState {
  status: "idle" | "success" | "error" | "rateLimited";
  fieldErrors?: ContactFormFieldErrors;
  /** Translated client-side via `form.errors.<key>` — see messages/*.json. */
  generalError?: "turnstileFailed" | "tooMany" | "serverError";
  /** Never clear the visitor's typed message on error (brief). */
  values?: ContactFormValues;
}

/**
 * Public Server Action behind the contact form. No admin session involved —
 * this is the one place in the project where an anonymous visitor causes a
 * database write, which is exactly why every layer here (honeypot, Zod,
 * Turnstile, rate limit) exists before that write happens.
 */
export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const values: ContactFormValues = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Honeypot: invisible to a real visitor, only a bot fills it in. Fake
  // success — never store, never send, never hint that anything was caught.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return { status: "success" };
  }

  const parsed = parseContactForm(formData);
  if (!parsed.ok) {
    return { status: "error", fieldErrors: parsed.fieldErrors, values };
  }
  const { data } = parsed;

  const ip = await clientIp();
  const ipHash = hashIp(ip);
  const supabase = createServiceRoleClient();

  if (await isRateLimited(supabase, ipHash)) {
    return { status: "rateLimited", generalError: "tooMany", values };
  }

  const turnstileOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstileOk) {
    return { status: "error", generalError: "turnstileFailed", values };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      message: data.message,
      locale: data.locale,
      ip_hash: ipHash,
      email_delivery_status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[contact] Speichern der Nachricht fehlgeschlagen:", insertError?.message);
    return { status: "error", generalError: "serverError", values };
  }

  // Store first, send second — a Resend outage must never lose the message
  // (brief). The visitor sees success either way; a failure here only
  // surfaces in the admin inbox (email_delivery_status).
  const emailOk = await sendContactEmails({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    message: data.message,
    locale: data.locale,
  });

  await supabase
    .from("contact_messages")
    .update({ email_delivery_status: emailOk ? "sent" : "failed" })
    .eq("id", inserted.id);

  return { status: "success" };
}
