"use client";

import { useState, useTransition } from "react";
import { useToast, useUnsavedWarning } from "@/lib/admin/toast";
import { saveSettings } from "./actions";

export interface SettingsRow {
  registration_open: boolean;
  current_edition_year: number;
  course_date: string | null;
  price_chf: number | null;
  contact_email: string | null;
  venue_name: string | null;
  venue_address: string | null;
  ueber_ansatz_visible: boolean;
}

interface FormState extends Omit<SettingsRow, "price_chf"> {
  price_chf: string;
}

function toForm(row: SettingsRow): FormState {
  return { ...row, price_chf: row.price_chf == null ? "" : String(row.price_chf) };
}

export default function SettingsEditor({ initial }: { initial: SettingsRow }) {
  const [values, setValues] = useState<FormState>(toForm(initial));
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  useUnsavedWarning(dirty);

  const patch = (changes: Partial<FormState>) => {
    setValues((v) => ({ ...v, ...changes }));
    setDirty(true);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const priceNum = values.price_chf.trim() === "" ? null : Number(values.price_chf);
      const result = await saveSettings({
        registration_open: values.registration_open,
        current_edition_year: values.current_edition_year,
        course_date: values.course_date,
        price_chf: priceNum,
        contact_email: values.contact_email,
        venue_name: values.venue_name,
        venue_address: values.venue_address,
        ueber_ansatz_visible: values.ueber_ansatz_visible,
      });
      if (!result.ok) return toast.error(result.error ?? "Speichern fehlgeschlagen.");
      setDirty(false);
      toast.success("Gespeichert.");
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="a-label">Anmeldung & Einstellungen</p>
      <h1 className="a-page-title">Jahr, Datum, Preis, Ort</h1>
      <p className="a-page-lead">
        Diese Werte ersetzen automatisch die Platzhalter <code>{"{year}"}</code>,{" "}
        <code>{"{price}"}</code> und das Datum überall auf der Seite. Der Schalter unten
        entscheidet, ob Besucher:innen das Anmeldeformular sehen oder den
        „Save-the-Date“-Hinweis.
      </p>

      <div className="a-card">
        <div className="a-card-head">
          <h2 className="a-card-title">Anmeldung offen / geschlossen</h2>
          <span
            className={`a-badge ${values.registration_open ? "a-badge-open" : "a-badge-warn"}`}
          >
            {values.registration_open ? "Offen" : "Geschlossen"}
          </span>
        </div>

        <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-8)" }}>
          <input
            type="checkbox"
            checked={values.registration_open}
            onChange={(e) => patch({ registration_open: e.target.checked })}
          />
          <strong>Anmeldung ist offen</strong>
        </label>
        <p className="a-field-help" style={{ marginTop: "var(--space-6)" }}>
          Solange dieser Schalter aus ist, zeigt <code>/anmeldung</code> den
          „Save-the-Date“-Hinweis (aktuell auch der Zustand auf der Live-Seite).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-13)", marginTop: "var(--space-15)" }}>
          <PreviewCard
            title="Wenn geschlossen"
            active={!values.registration_open}
            body={
              <>
                Save-the-Date, Datum und Zurück-Button. Kein Formular. Text kommt aus{" "}
                <em>Inhalte → Anmeldung</em>.
              </>
            }
          />
          <PreviewCard
            title="Wenn offen"
            active={values.registration_open}
            body={<>Anmeldeformular mit den Feldern aus Phase 5 (kommt später).</>}
          />
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <h2 className="a-card-title">Kursdaten</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-13)" }}>
          <div className="a-field">
            <label className="a-field-label" htmlFor="year">
              Aktuelle Ausgabe (Jahr)
            </label>
            <input
              id="year"
              className="a-input"
              type="number"
              min={2020}
              max={2100}
              value={values.current_edition_year}
              onChange={(e) => patch({ current_edition_year: Number(e.target.value) })}
            />
          </div>
          <div className="a-field">
            <label className="a-field-label" htmlFor="date">
              Kursdatum
            </label>
            <input
              id="date"
              className="a-input"
              type="date"
              value={values.course_date ?? ""}
              onChange={(e) => patch({ course_date: e.target.value || null })}
            />
          </div>
          <div className="a-field">
            <label className="a-field-label" htmlFor="price">
              Preis (CHF)
            </label>
            <p className="a-field-help">Leer lassen, wenn nicht angezeigt werden soll.</p>
            <input
              id="price"
              className="a-input"
              type="number"
              min={0}
              step={0.05}
              value={values.price_chf}
              onChange={(e) => patch({ price_chf: e.target.value })}
            />
          </div>
          <div className="a-field">
            <label className="a-field-label" htmlFor="email">
              Kontakt-E-Mail
            </label>
            <p className="a-field-help">Empfänger der Kontaktanfragen (kommt in Phase 5 zum Tragen).</p>
            <input
              id="email"
              className="a-input"
              type="email"
              value={values.contact_email ?? ""}
              onChange={(e) => patch({ contact_email: e.target.value || null })}
            />
          </div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <h2 className="a-card-title">Über uns — Abschnitt „Etwas zurückgeben“</h2>
          <span
            className={`a-badge ${values.ueber_ansatz_visible ? "a-badge-open" : "a-badge-warn"}`}
          >
            {values.ueber_ansatz_visible ? "Sichtbar" : "Ausgeblendet"}
          </span>
        </div>

        <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-8)" }}>
          <input
            type="checkbox"
            checked={values.ueber_ansatz_visible}
            onChange={(e) => patch({ ueber_ansatz_visible: e.target.checked })}
          />
          <strong>Abschnitt anzeigen</strong>
        </label>
        <p className="a-field-help" style={{ marginTop: "var(--space-6)" }}>
          Steuert den Karussell- und Textblock ganz unten auf <code>/ueber-uns</code> (Inhalte
          unter <em>Inhalte → Über uns</em>). Solange der Schalter aus ist, wird der Abschnitt
          nicht angezeigt — die Texte und Bilder bleiben aber erhalten.
        </p>
      </div>

      <div className="a-card">
        <div className="a-card-head">
          <h2 className="a-card-title">Veranstaltungsort</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-13)" }}>
          <div className="a-field">
            <label className="a-field-label" htmlFor="venue">
              Name der Halle
            </label>
            <input
              id="venue"
              className="a-input"
              type="text"
              value={values.venue_name ?? ""}
              onChange={(e) => patch({ venue_name: e.target.value || null })}
              maxLength={120}
            />
          </div>
          <div className="a-field">
            <label className="a-field-label" htmlFor="address">
              Adresse
            </label>
            <input
              id="address"
              className="a-input"
              type="text"
              value={values.venue_address ?? ""}
              onChange={(e) => patch({ venue_address: e.target.value || null })}
              maxLength={160}
            />
          </div>
        </div>
      </div>

      <div className="a-savebar">
        <span className={dirty ? "a-savebar-state a-savebar-dirty" : "a-savebar-state"}>
          {dirty ? "Ungespeicherte Änderungen" : "Alles gespeichert"}
        </span>
        <button type="submit" className="a-btn a-btn-primary" disabled={pending || !dirty}>
          {pending ? "Wird gespeichert …" : "Speichern"}
        </button>
      </div>
    </form>
  );
}

function PreviewCard({ title, active, body }: { title: string; active: boolean; body: React.ReactNode }) {
  return (
    <div
      className="a-notice"
      style={{
        opacity: active ? 1 : 0.5,
        borderColor: active ? "var(--color-green-dark)" : "var(--color-green-a12)",
      }}
    >
      <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
        {title}
        {active ? <span className="a-badge a-badge-open">aktiv</span> : null}
      </h2>
      <p>{body}</p>
    </div>
  );
}
