/**
 * Content registry — the single source of truth for every editable text/image
 * field on the public site.
 *
 * The admin UI (Phase 3) is generated from this list, and the database is
 * seeded from it. Adding a new editable field later = adding one entry here.
 *
 * Each `key` matches a row in the `content_blocks` table. Row-based content
 * (team members, carousel, testimonials, stats) and the year/date/price/venue
 * live in their own tables (team_members, …, site_settings), not here.
 *
 * PLACEHOLDERS: text may contain `{year}`, `{price}` or `{date}`. The content
 * layer replaces these from `site_settings` at render time, so the site stays
 * year/price/date-neutral (brief §2.4) — e.g. the hero badge "Skill Training
 * {year}" updates everywhere when the edition year changes.
 */

export type ContentKind = "text" | "longtext" | "image" | "url" | "boolean";

export type PageId = "global" | "home" | "ueber" | "impressionen" | "kontakt" | "anmeldung";

export interface ContentField {
  /** Stable key, also the `content_blocks.key` value. */
  readonly key: string;
  readonly kind: ContentKind;
  /** German label shown in the admin. */
  readonly label: string;
  /** German help text (optional). */
  readonly help?: string;
  /** Character limit for text/longtext (advisory, shown as a counter). */
  readonly maxLength?: number;
  readonly page: PageId;
  /** German section grouping within the page. */
  readonly section: string;
  /** Image fields only — CSS aspect-ratio of the target usage, so the
      focal-point picker (Block F) previews the actual crop shape. */
  readonly aspectRatio?: string;
}

export const CONTENT_REGISTRY = [
  // ─── Global ────────────────────────────────────────────────────────────────
  {
    key: "common.brand",
    kind: "text",
    label: "Markenname",
    help: "Erscheint im Kopf (Logo-Schriftzug) und in der Fusszeile.",
    maxLength: 40,
    page: "global",
    section: "Allgemein",
  },
  {
    key: "nav.ueber",
    kind: "text",
    label: "Navigation: Über uns",
    maxLength: 30,
    page: "global",
    section: "Navigation",
  },
  {
    key: "nav.impressionen",
    kind: "text",
    label: "Navigation: Impressionen",
    maxLength: 30,
    page: "global",
    section: "Navigation",
  },
  {
    key: "nav.kontakt",
    kind: "text",
    label: "Navigation: Kontakt",
    maxLength: 30,
    page: "global",
    section: "Navigation",
  },
  {
    key: "nav.anmelden",
    kind: "text",
    label: "Navigation: Anmelden",
    maxLength: 30,
    page: "global",
    section: "Navigation",
  },
  {
    key: "footer.org",
    kind: "text",
    label: "Fusszeile: Organisatoren",
    help: "Die Zeile «Organisiert von …».",
    maxLength: 120,
    page: "global",
    section: "Fusszeile",
  },

  // ─── Home · Hero ─────────────────────────────────────────────────────────────
  {
    key: "home.hero.tag",
    kind: "text",
    label: "Badge",
    help: "«{year}» wird automatisch durch das aktuelle Jahr ersetzt.",
    maxLength: 40,
    page: "home",
    section: "Hero",
  },
  {
    key: "home.hero.subtitle",
    kind: "text",
    label: "Untertitel",
    maxLength: 80,
    page: "home",
    section: "Hero",
  },
  {
    key: "home.hero.ctaPrimary",
    kind: "text",
    label: "Button 1 (Text)",
    maxLength: 30,
    page: "home",
    section: "Hero",
  },
  {
    key: "home.hero.ctaSecondary",
    kind: "text",
    label: "Button 2 (Text)",
    maxLength: 30,
    page: "home",
    section: "Hero",
  },
  {
    key: "home.hero.image1",
    kind: "image",
    label: "Hero-Bild 1",
    help: "Rotierendes Hintergrundbild (z. B. Vanessa).",
    page: "home",
    section: "Hero",
    aspectRatio: "16 / 9",
  },
  {
    key: "home.hero.image2",
    kind: "image",
    label: "Hero-Bild 2",
    help: "Rotierendes Hintergrundbild (z. B. Pascal).",
    page: "home",
    section: "Hero",
    aspectRatio: "16 / 9",
  },
  {
    key: "home.hero.image3",
    kind: "image",
    label: "Hero-Bild 3",
    help: "Rotierendes Hintergrundbild (z. B. Claudio).",
    page: "home",
    section: "Hero",
    aspectRatio: "16 / 9",
  },

  // ─── Home · Eckdaten ────────────────────────────────────────────────────────
  // NEW (Aug 2026 UI-Pass, Block E). The facts themselves (icon/label/value/
  // status/order) live in their own table (home_facts, admin at
  // /admin/eckdaten) — same split as team_members vs. content_blocks. Only the
  // section's own title/lead and the two shared status hints are registered
  // here.
  {
    key: "home.facts.title",
    kind: "text",
    label: "Titel",
    maxLength: 60,
    page: "home",
    section: "Eckdaten",
  },
  {
    key: "home.facts.lead",
    kind: "longtext",
    label: "Beschreibung",
    help: "Maximal 1-2 Sätze.",
    maxLength: 200,
    page: "home",
    section: "Eckdaten",
  },
  {
    key: "home.facts.statusOpen",
    kind: "text",
    label: "Hinweistext — Status «Datum noch offen»",
    help: "Wird bei jedem Eckdatum mit diesem Status statt eines Werts angezeigt.",
    maxLength: 60,
    page: "home",
    section: "Eckdaten",
  },
  {
    key: "home.facts.statusSoon",
    kind: "text",
    label: "Hinweistext — Status «Kommt bald»",
    help: "Wird bei jedem Eckdatum mit diesem Status statt eines Werts angezeigt.",
    maxLength: 60,
    page: "home",
    section: "Eckdaten",
  },

  // ─── Home · Was wir anbieten ────────────────────────────────────────────────
  {
    key: "home.wwm.label",
    kind: "text",
    label: "Label",
    maxLength: 40,
    page: "home",
    section: "Was wir anbieten",
  },
  {
    key: "home.wwm.title",
    kind: "text",
    label: "Titel",
    maxLength: 80,
    page: "home",
    section: "Was wir anbieten",
  },
  {
    key: "home.wwm.p1",
    kind: "longtext",
    label: "Text",
    help: "Fett mit <b>…</b> möglich. Kurz halten — die Startseite lebt von Bildern, nicht von Fliesstext.",
    maxLength: 240,
    page: "home",
    section: "Was wir anbieten",
  },
  {
    key: "home.wwm.badge1",
    kind: "text",
    label: "Badge 1",
    maxLength: 30,
    page: "home",
    section: "Was wir anbieten",
  },
  {
    key: "home.wwm.badge2",
    kind: "text",
    label: "Badge 2",
    maxLength: 30,
    page: "home",
    section: "Was wir anbieten",
  },
  {
    key: "home.wwm.cta",
    kind: "text",
    label: "Button (Text)",
    help: "«{price}» wird automatisch durch den Preis ersetzt.",
    maxLength: 40,
    page: "home",
    section: "Was wir anbieten",
  },
  {
    key: "home.wwm.image",
    kind: "image",
    label: "Bild",
    page: "home",
    section: "Was wir anbieten",
    aspectRatio: "4 / 3",
  },

  // ─── Home · Eindrücke (horizontale Bilderreihe) ────────────────────────────
  // NEW (Aug 2026 UI-Pass) — the whole section is skipped on the public page
  // until at least one of the 6 images below is filled in (same pattern as
  // the Über-uns banner, B10 in docs/PLATZHALTER.md).
  {
    key: "home.gallery.title",
    kind: "text",
    label: "Titel",
    maxLength: 60,
    page: "home",
    section: "Eindrücke",
  },
  {
    key: "home.gallery.image1",
    kind: "image",
    label: "Bild 1",
    page: "home",
    section: "Eindrücke",
    aspectRatio: "3 / 4",
  },
  {
    key: "home.gallery.image2",
    kind: "image",
    label: "Bild 2",
    page: "home",
    section: "Eindrücke",
    aspectRatio: "3 / 4",
  },
  {
    key: "home.gallery.image3",
    kind: "image",
    label: "Bild 3",
    page: "home",
    section: "Eindrücke",
    aspectRatio: "3 / 4",
  },
  {
    key: "home.gallery.image4",
    kind: "image",
    label: "Bild 4",
    page: "home",
    section: "Eindrücke",
    aspectRatio: "3 / 4",
  },
  {
    key: "home.gallery.image5",
    kind: "image",
    label: "Bild 5",
    page: "home",
    section: "Eindrücke",
    aspectRatio: "3 / 4",
  },
  {
    key: "home.gallery.image6",
    kind: "image",
    label: "Bild 6",
    page: "home",
    section: "Eindrücke",
    aspectRatio: "3 / 4",
  },

  // ─── Home · Abschluss-Banner ────────────────────────────────────────────────
  {
    key: "home.cta.title",
    kind: "text",
    label: "Überschrift",
    maxLength: 60,
    page: "home",
    section: "Abschluss-Banner",
  },

  // ─── Über uns · Kopf ────────────────────────────────────────────────────────
  {
    key: "ueber.header.tag",
    kind: "text",
    label: "Badge",
    maxLength: 30,
    page: "ueber",
    section: "Kopf",
  },
  {
    key: "ueber.header.title",
    kind: "text",
    label: "Titel",
    maxLength: 40,
    page: "ueber",
    section: "Kopf",
  },
  {
    key: "ueber.header.subtitle",
    kind: "text",
    label: "Untertitel",
    maxLength: 80,
    page: "ueber",
    section: "Kopf",
  },
  {
    key: "ueber.header.image",
    kind: "image",
    label: "Kopf-Hintergrundbild",
    help: "Optional. Ohne Bild bleibt der Kopf dunkelgrün.",
    page: "ueber",
    section: "Kopf",
    aspectRatio: "16 / 9",
  },

  // ─── Über uns · Unser Ansatz ────────────────────────────────────────────────
  {
    key: "ueber.ansatz.label",
    kind: "text",
    label: "Label",
    maxLength: 40,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.title",
    kind: "text",
    label: "Titel",
    maxLength: 60,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.lead",
    kind: "longtext",
    label: "Lead-Absatz",
    maxLength: 300,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.p",
    kind: "longtext",
    label: "Absatz",
    maxLength: 500,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.feature1Title",
    kind: "text",
    label: "Feature 1 · Titel",
    maxLength: 40,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.feature1Text",
    kind: "text",
    label: "Feature 1 · Text",
    maxLength: 120,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.feature1Image",
    kind: "image",
    label: "Feature 1 · Bild",
    help: "Optional. Ohne Bild bleibt es beim Emoji 🎯.",
    page: "ueber",
    section: "Unser Ansatz",
    aspectRatio: "1 / 1",
  },
  {
    key: "ueber.ansatz.feature2Title",
    kind: "text",
    label: "Feature 2 · Titel",
    maxLength: 40,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.feature2Text",
    kind: "text",
    label: "Feature 2 · Text",
    maxLength: 120,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.feature2Image",
    kind: "image",
    label: "Feature 2 · Bild",
    help: "Optional. Ohne Bild bleibt es beim Emoji 👥.",
    page: "ueber",
    section: "Unser Ansatz",
    aspectRatio: "1 / 1",
  },
  {
    key: "ueber.ansatz.feature3Title",
    kind: "text",
    label: "Feature 3 · Titel",
    maxLength: 40,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.feature3Text",
    kind: "text",
    label: "Feature 3 · Text",
    maxLength: 120,
    page: "ueber",
    section: "Unser Ansatz",
  },
  {
    key: "ueber.ansatz.feature3Image",
    kind: "image",
    label: "Feature 3 · Bild",
    help: "Optional. Ohne Bild bleibt es beim Emoji 🏆.",
    page: "ueber",
    section: "Unser Ansatz",
    aspectRatio: "1 / 1",
  },
  {
    key: "ueber.ansatz.cta",
    kind: "text",
    label: "Button (Text)",
    maxLength: 30,
    page: "ueber",
    section: "Unser Ansatz",
  },

  // ─── Über uns · Team ────────────────────────────────────────────────────────
  {
    key: "ueber.team.label",
    kind: "text",
    label: "Label",
    maxLength: 40,
    page: "ueber",
    section: "Team",
  },
  {
    key: "ueber.team.title",
    kind: "text",
    label: "Titel",
    help: "Die Trainer-Karten selbst bearbeitest du unter «Team».",
    maxLength: 60,
    page: "ueber",
    section: "Team",
  },

  // ─── Über uns · Banner ──────────────────────────────────────────────────────
  {
    key: "ueber.banner",
    kind: "image",
    label: "Breites Banner-Bild",
    help: "Optional, zwischen Team und Zitaten. Ohne Bild erscheint hier gar nichts — kein leerer Platzhalter-Balken.",
    page: "ueber",
    section: "Banner",
    aspectRatio: "3 / 1",
  },

  // ─── Über uns · Zitate ──────────────────────────────────────────────────────
  {
    key: "ueber.zitate.label",
    kind: "text",
    label: "Label",
    maxLength: 40,
    page: "ueber",
    section: "Zitate",
  },
  {
    key: "ueber.zitate.title",
    kind: "text",
    label: "Titel",
    help: "Die Zitate selbst bearbeitest du unter «Zitate & Zahlen».",
    maxLength: 60,
    page: "ueber",
    section: "Zitate",
  },

  // ─── Impressionen ───────────────────────────────────────────────────────────
  {
    key: "impressionen.tag",
    kind: "text",
    label: "Badge",
    maxLength: 30,
    page: "impressionen",
    section: "Kopf",
  },
  {
    key: "impressionen.title",
    kind: "text",
    label: "Titel",
    maxLength: 40,
    page: "impressionen",
    section: "Kopf",
  },
  {
    key: "impressionen.subtitle",
    kind: "text",
    label: "Untertitel",
    maxLength: 120,
    page: "impressionen",
    section: "Kopf",
  },
  {
    key: "impressionen.headerImage",
    kind: "image",
    label: "Kopf-Hintergrundbild",
    page: "impressionen",
    section: "Kopf",
    aspectRatio: "16 / 9",
  },

  // ─── Kontakt ────────────────────────────────────────────────────────────────
  {
    key: "kontakt.tag",
    kind: "text",
    label: "Badge",
    maxLength: 30,
    page: "kontakt",
    section: "Kopf",
  },
  {
    key: "kontakt.title",
    kind: "text",
    label: "Titel",
    maxLength: 40,
    page: "kontakt",
    section: "Kopf",
  },
  {
    key: "kontakt.infoTitle",
    kind: "text",
    label: "Info · Titel",
    maxLength: 80,
    page: "kontakt",
    section: "Info",
  },
  {
    key: "kontakt.infoText",
    kind: "longtext",
    label: "Info · Text",
    maxLength: 300,
    page: "kontakt",
    section: "Info",
  },
  // ─── Anmeldung (geschlossener Zustand) ──────────────────────────────────────
  {
    key: "anmeldung.tag",
    kind: "text",
    label: "Badge",
    maxLength: 30,
    page: "anmeldung",
    section: "Kopf",
  },
  {
    key: "anmeldung.title",
    kind: "text",
    label: "Titel",
    help: "«{year}» wird automatisch eingesetzt. Anmeldung offen/geschlossen stellst du unter «Anmeldung & Einstellungen».",
    maxLength: 40,
    page: "anmeldung",
    section: "Kopf",
  },
  {
    key: "anmeldung.subtitle",
    kind: "text",
    label: "Untertitel",
    maxLength: 120,
    page: "anmeldung",
    section: "Kopf",
  },
  {
    key: "anmeldung.label",
    kind: "text",
    label: "Save-the-Date · Label",
    maxLength: 40,
    page: "anmeldung",
    section: "Hinweis",
  },
  {
    key: "anmeldung.heading",
    kind: "text",
    label: "Save-the-Date · Überschrift",
    maxLength: 80,
    page: "anmeldung",
    section: "Hinweis",
  },
  {
    key: "anmeldung.text",
    kind: "longtext",
    label: "Save-the-Date · Text",
    maxLength: 400,
    page: "anmeldung",
    section: "Hinweis",
  },
  {
    key: "anmeldung.back",
    kind: "text",
    label: "Zurück-Button (Text)",
    maxLength: 40,
    page: "anmeldung",
    section: "Hinweis",
  },
] as const satisfies readonly ContentField[];

/** Union of every registered key — use for type-safe content lookups. */
export type ContentKey = (typeof CONTENT_REGISTRY)[number]["key"];

/** Fields grouped by page, then section — convenient for the admin UI. */
export function registryByPage(): Record<PageId, Record<string, ContentField[]>> {
  const out = {} as Record<PageId, Record<string, ContentField[]>>;
  for (const field of CONTENT_REGISTRY) {
    out[field.page] ??= {};
    (out[field.page][field.section] ??= []).push(field);
  }
  return out;
}

/** Look up a single field definition by key. */
export function getField(key: ContentKey): ContentField | undefined {
  return CONTENT_REGISTRY.find((f) => f.key === key);
}
