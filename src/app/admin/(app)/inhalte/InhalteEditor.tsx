"use client";

import { useMemo, useState, useTransition } from "react";
import type { ContentField, PageId } from "@/content/registry";
import ImageField from "@/components/admin/ImageField";
import { DEFAULT_FOCAL, type FocalPoint } from "@/components/admin/FocalPointEditor";
import type { ImagePaths } from "@/lib/image-sizes";
import { useToast, useUnsavedWarning } from "@/lib/admin/toast";
import { saveInhaltePage } from "./actions";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;
type Loc = (typeof LOCALES)[number]["code"];

export interface EditorField {
  field: ContentField;
  /** Current text per locale, or null when unset. */
  texts?: Record<Loc, string>;
  /** Image slot: current paths (all three sizes) + alts. */
  path?: ImagePaths | null;
  alts?: Record<Loc, string>;
  /** Image slot: focal point + zoom (Block F). */
  focal?: FocalPoint;
}

interface EditorSection {
  title: string;
  fields: EditorField[];
}

interface Props {
  page: PageId;
  pageLabel: string;
  sections: EditorSection[];
}

/**
 * The generic content editor. Same shape drives every /admin/inhalte/[page]
 * screen — a page's list of registry fields, one section per group, DE/EN/FR
 * tabs at the top. All state is local; the Server Action does the write.
 */
export default function InhalteEditor({ page, pageLabel, sections }: Props) {
  const initial = useMemo(() => buildInitial(sections), [sections]);
  const [values, setValues] = useState(initial);
  const [language, setLanguage] = useState<Loc>("de");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  useUnsavedWarning(dirty);

  const setText = (key: string, loc: Loc, next: string) => {
    setValues((v) => ({ ...v, texts: { ...v.texts, [key]: { ...v.texts[key], [loc]: next } } }));
    setDirty(true);
  };

  const setAlt = (key: string, loc: Loc, next: string) => {
    setValues((v) => ({ ...v, alts: { ...v.alts, [key]: { ...v.alts[key], [loc]: next } } }));
    setDirty(true);
  };

  const setPath = (key: string, next: ImagePaths | null) => {
    setValues((v) => ({ ...v, paths: { ...v.paths, [key]: next } }));
    setDirty(true);
  };

  const setFocal = (key: string, next: FocalPoint) => {
    setValues((v) => ({ ...v, focals: { ...v.focals, [key]: next } }));
    setDirty(true);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData();
    for (const section of sections) {
      for (const { field } of section.fields) {
        if (field.kind === "image") {
          const paths = values.paths[field.key];
          formData.set(`${field.key}::path`, paths?.large ?? "");
          formData.set(`${field.key}::path_thumb`, paths?.thumb ?? "");
          formData.set(`${field.key}::path_medium`, paths?.medium ?? "");
          for (const loc of LOCALES) {
            formData.set(`${field.key}::alt_${loc.code}`, values.alts[field.key]?.[loc.code] ?? "");
          }
          const focal = values.focals[field.key] ?? DEFAULT_FOCAL;
          formData.set(`${field.key}::focal_x`, String(focal.focalX));
          formData.set(`${field.key}::focal_y`, String(focal.focalY));
          formData.set(`${field.key}::zoom`, String(focal.zoom));
        } else {
          for (const loc of LOCALES) {
            formData.set(`${field.key}::${loc.code}`, values.texts[field.key]?.[loc.code] ?? "");
          }
        }
      }
    }

    startTransition(async () => {
      const result = await saveInhaltePage(page, formData);
      if (result.ok) {
        setDirty(false);
        toast.success("Gespeichert.");
      } else {
        toast.error(result.error ?? "Speichern fehlgeschlagen.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-11)" }}>
        <div>
          <p className="a-label">Inhalte</p>
          <h1 className="a-page-title">{pageLabel}</h1>
        </div>

        <div className="a-tabs" role="tablist" aria-label="Sprache">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              type="button"
              role="tab"
              className="a-tab"
              aria-selected={language === loc.code}
              onClick={() => setLanguage(loc.code)}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      <p className="a-page-lead">
        Änderungen sind sofort auf der Website sichtbar — es gibt keinen Entwurfsmodus. DE ist
        Pflicht; leere EN/FR fallen automatisch auf Deutsch zurück.
      </p>

      {sections.map((section) => (
        <div key={section.title} className="a-card">
          <div className="a-card-head">
            <h2 className="a-card-title">{section.title}</h2>
          </div>

          {section.fields.map(({ field }) =>
            field.kind === "image" ? (
              <div key={field.key}>
                <ImageField
                  fieldKey={field.key}
                  label={field.label}
                  help={field.help}
                  value={values.paths[field.key] ?? null}
                  onChange={(next) => setPath(field.key, next)}
                  focal={values.focals[field.key] ?? DEFAULT_FOCAL}
                  onFocalChange={(next) => setFocal(field.key, next)}
                  aspectRatio={field.aspectRatio}
                />
                <TextInput
                  label={`Alternativtext (${language.toUpperCase()})`}
                  help="Wird von Screenreadern vorgelesen und angezeigt, wenn das Bild nicht lädt."
                  value={values.alts[field.key]?.[language] ?? ""}
                  onChange={(next) => setAlt(field.key, language, next)}
                  maxLength={140}
                  language={language}
                />
              </div>
            ) : (
              <TextInput
                key={field.key}
                label={field.label}
                help={field.help}
                value={values.texts[field.key]?.[language] ?? ""}
                onChange={(next) => setText(field.key, language, next)}
                maxLength={field.maxLength}
                multiline={field.kind === "longtext"}
                language={language}
                required={language === "de" && !isSetInAny(values.texts[field.key])}
              />
            )
          )}
        </div>
      ))}

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

// ── small pieces ───────────────────────────────────────────────────────────

interface TextInputProps {
  label: string;
  help?: string;
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  multiline?: boolean;
  language: Loc;
  required?: boolean;
}

function TextInput({ label, help, value, onChange, maxLength, multiline, language, required }: TextInputProps) {
  const over = maxLength ? value.length > maxLength : false;
  const isFallback = language !== "de" && value.trim() === "";
  return (
    <div className="a-field">
      <label className="a-field-label">
        {label} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
      </label>
      {help ? <p className="a-field-help">{help}</p> : null}

      {multiline ? (
        <textarea
          className={`a-textarea ${over ? "a-input-invalid" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          className={`a-input ${over ? "a-input-invalid" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="text"
        />
      )}

      <div className="a-field-foot">
        <span>
          {isFallback ? "Leer — fällt auf Deutsch zurück." : required ? "Pflichtfeld auf Deutsch." : " "}
        </span>
        {maxLength ? (
          <span className={over ? "a-counter-over" : undefined}>
            {value.length} / {maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ── initial-state helpers ─────────────────────────────────────────────────

function buildInitial(sections: EditorSection[]) {
  const texts: Record<string, Record<Loc, string>> = {};
  const paths: Record<string, ImagePaths | null> = {};
  const alts: Record<string, Record<Loc, string>> = {};
  const focals: Record<string, FocalPoint> = {};

  for (const section of sections) {
    for (const { field, texts: t, path, alts: a, focal } of section.fields) {
      if (field.kind === "image") {
        paths[field.key] = path ?? null;
        alts[field.key] = { de: a?.de ?? "", en: a?.en ?? "", fr: a?.fr ?? "" };
        focals[field.key] = focal ?? DEFAULT_FOCAL;
      } else {
        texts[field.key] = { de: t?.de ?? "", en: t?.en ?? "", fr: t?.fr ?? "" };
      }
    }
  }
  return { texts, paths, alts, focals };
}

function isSetInAny(record: Record<Loc, string> | undefined): boolean {
  if (!record) return false;
  return Boolean(record.de.trim() || record.en.trim() || record.fr.trim());
}
