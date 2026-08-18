"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendMagicLink, type LoginState } from "./actions";

const INITIAL: LoginState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="a-btn a-btn-primary" disabled={pending} style={{ width: "100%" }}>
      {pending ? "Wird gesendet …" : "Link zusenden"}
    </button>
  );
}

export default function LoginForm({ next }: { next: string | null }) {
  const [state, formAction] = useActionState(sendMagicLink, INITIAL);

  if (state.status === "sent") {
    return (
      <div>
        <p className="a-notice">
          <strong>E-Mail unterwegs.</strong> Wenn <strong>{state.email}</strong> für den
          Admin-Bereich freigeschaltet ist, liegt gleich ein Anmelde-Link im Posteingang. Der Link
          gilt eine Stunde und funktioniert einmal.
        </p>
        <p className="a-login-hint">
          Nichts erhalten? Schau im Spam-Ordner nach. Der Link muss{" "}
          <strong>im selben Browser</strong> geöffnet werden, in dem du ihn angefordert hast.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {next ? <input type="hidden" name="weiter" value={next} /> : null}

      <div className="a-field">
        <label className="a-field-label" htmlFor="email">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          defaultValue={state.email ?? ""}
          className={`a-input ${state.status === "error" ? "a-input-invalid" : ""}`}
          aria-describedby={state.status === "error" ? "login-error" : undefined}
          placeholder="vorname@beispiel.ch"
        />
      </div>

      {state.status === "error" ? (
        <p id="login-error" role="alert" className="a-error" style={{ marginBottom: "var(--space-13)" }}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
