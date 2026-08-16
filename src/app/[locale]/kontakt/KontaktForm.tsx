"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { submitContactForm, type ContactFormState } from "./actions";
import TurnstileWidget from "./TurnstileWidget";
import styles from "./Kontakt.module.css";

// A plain object can't be exported from a "use server" file (every export
// there must be an async function) — so the initial state lives here instead.
const INITIAL_STATE: ContactFormState = { status: "idle" };

function SubmitButton() {
  const t = useTranslations("kontakt.form");
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.emailBtn} disabled={pending}>
      {pending ? t("submitPending") : t("submit")}
    </button>
  );
}

export default function KontaktForm() {
  const t = useTranslations("kontakt.form");
  const locale = useLocale();
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    submitContactForm,
    INITIAL_STATE
  );
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);

  // Turnstile tokens are single-use — any failed attempt needs a fresh
  // challenge before the visitor can retry.
  useEffect(() => {
    if (state.status === "error" || state.status === "rateLimited") {
      setToken("");
      setAttempt((a) => a + 1);
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className={styles.successBox} role="status">
        <h2>{t("successTitle")}</h2>
        <p>{t("successText")}</p>
      </div>
    );
  }

  const fieldError = (field: string) => {
    const key = state.fieldErrors?.[field as keyof NonNullable<typeof state.fieldErrors>];
    return key ? t(`errors.${key}`) : undefined;
  };

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="turnstileToken" value={token} readOnly />

      {/* Honeypot — real visitors never see or fill this in. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="firstName">
            {t("firstName")}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            defaultValue={state.values?.firstName ?? ""}
            className={`${styles.input} ${fieldError("firstName") ? styles.inputInvalid : ""}`}
            aria-invalid={fieldError("firstName") ? true : undefined}
            aria-describedby={fieldError("firstName") ? "firstName-error" : undefined}
          />
          {fieldError("firstName") && (
            <p id="firstName-error" role="alert" className={styles.fieldError}>
              {fieldError("firstName")}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="lastName">
            {t("lastName")}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            defaultValue={state.values?.lastName ?? ""}
            className={`${styles.input} ${fieldError("lastName") ? styles.inputInvalid : ""}`}
            aria-invalid={fieldError("lastName") ? true : undefined}
            aria-describedby={fieldError("lastName") ? "lastName-error" : undefined}
          />
          {fieldError("lastName") && (
            <p id="lastName-error" role="alert" className={styles.fieldError}>
              {fieldError("lastName")}
            </p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="email">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
          defaultValue={state.values?.email ?? ""}
          className={`${styles.input} ${fieldError("email") ? styles.inputInvalid : ""}`}
          aria-invalid={fieldError("email") ? true : undefined}
          aria-describedby={fieldError("email") ? "email-error" : undefined}
        />
        {fieldError("email") && (
          <p id="email-error" role="alert" className={styles.fieldError}>
            {fieldError("email")}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="message">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          placeholder={t("messagePlaceholder")}
          defaultValue={state.values?.message ?? ""}
          className={`${styles.textarea} ${fieldError("message") ? styles.inputInvalid : ""}`}
          aria-invalid={fieldError("message") ? true : undefined}
          aria-describedby={fieldError("message") ? "message-error" : undefined}
        />
        {fieldError("message") && (
          <p id="message-error" role="alert" className={styles.fieldError}>
            {fieldError("message")}
          </p>
        )}
      </div>

      <div className={styles.consentRow}>
        <input type="checkbox" id="consent" name="consent" value="yes" required />
        <label htmlFor="consent" className={styles.consentText}>
          {t.rich("consent", {
            link: (chunks) => <Link href="/datenschutz">{chunks}</Link>,
          })}
        </label>
      </div>
      {fieldError("consent") && (
        <p role="alert" className={styles.fieldError}>
          {fieldError("consent")}
        </p>
      )}

      <TurnstileWidget key={attempt} onToken={setToken} language={locale} />

      {state.generalError && (
        <p role="alert" className={styles.generalError}>
          {t(`errors.${state.generalError}`)}
        </p>
      )}

      <div className={styles.submitRow}>
        <SubmitButton />
      </div>
    </form>
  );
}
