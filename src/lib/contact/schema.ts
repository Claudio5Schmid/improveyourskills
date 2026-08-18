import { z } from "zod";

/**
 * Field-level error "messages" are stable keys (not sentences) — see
 * messages/*.json under `kontakt.form.errors`. Keeping Zod locale-agnostic
 * means validation logic never has to know which language the visitor reads.
 */
export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, "required").max(100, "tooLong"),
  lastName: z.string().trim().min(1, "required").max(100, "tooLong"),
  email: z.string().trim().min(1, "required").max(200, "tooLong").email("invalidEmail"),
  message: z.string().trim().min(1, "required").max(5000, "tooLong"),
  consent: z.literal(true, "consentRequired"),
  locale: z.enum(["de", "en", "fr"]),
  turnstileToken: z.string().min(1, "turnstileRequired"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContactFormFieldErrors = Partial<Record<keyof ContactFormInput, string>>;

/**
 * FormData → typed input + per-field error keys. Kept separate from the
 * schema itself so the Server Action stays a thin wrapper around this.
 */
export function parseContactForm(
  formData: FormData
):
  | { ok: true; data: ContactFormInput }
  | { ok: false; fieldErrors: ContactFormFieldErrors } {
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    consent: formData.get("consent") === "yes",
    locale: String(formData.get("locale") ?? "de"),
    turnstileToken: String(formData.get("turnstileToken") ?? ""),
  };

  const result = contactFormSchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const fieldErrors: ContactFormFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ContactFormInput;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { ok: false, fieldErrors };
}
