import { safeAdminPath } from "@/lib/admin/safe-path";
import LoginForm from "./LoginForm";

const ERRORS: Record<string, string> = {
  konfiguration:
    "Der Admin-Bereich ist noch nicht mit der Datenbank verbunden. Bitte melde dich bei Claudio.",
  link: "Dieser Anmelde-Link ist abgelaufen oder wurde schon benutzt. Fordere unten einen neuen an.",
  kein_admin:
    "Diese Adresse ist zwar bekannt, hat aber keine Admin-Berechtigung. Bitte melde dich bei Claudio.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeAdminPath(typeof params.weiter === "string" ? params.weiter : null);
  const error = typeof params.fehler === "string" ? ERRORS[params.fehler] : undefined;

  return (
    <main className="a-login">
      <div className="a-login-card">
        <p className="a-label">Interner Bereich</p>
        <h1 className="a-login-brand">Improve your skills</h1>
        <p className="a-login-lead">
          Melde dich mit deiner E-Mail-Adresse an. Du bekommst einen Link zugeschickt — ein Passwort
          gibt es hier bewusst nicht.
        </p>

        {error ? (
          <p role="alert" className="a-error" style={{ marginBottom: "var(--space-15)" }}>
            {error}
          </p>
        ) : null}

        <LoginForm next={next} />

        <p className="a-login-hint">
          Nur eingeladene Personen haben Zugang. Neue Zugänge vergibt Claudio im
          Supabase-Dashboard — siehe <code>docs/ADMIN.md</code>.
        </p>
      </div>
    </main>
  );
}
