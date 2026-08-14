"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { refreshPublicContent } from "@/lib/admin/revalidate";
import { CONTENT_REGISTRY, type PageId } from "@/content/registry";

const PAGES: readonly PageId[] = [
  "global",
  "home",
  "ueber",
  "impressionen",
  "kontakt",
  "anmeldung",
];
const LOCALES = ["de", "en", "fr"] as const;
type Loc = (typeof LOCALES)[number];

export interface ContentSaveResult {
  ok: boolean;
  error?: string;
}

type FieldRow = {
  key: string;
  kind: string;
  updated_by: string;
  value_de?: string | null;
  value_en?: string | null;
  value_fr?: string | null;
  image_path?: string | null;
  image_alt_de?: string | null;
  image_alt_en?: string | null;
  image_alt_fr?: string | null;
  focal_x?: number;
  focal_y?: number;
  zoom?: number;
};

/**
 * Save every field of one page.
 *
 * Server Actions are their own HTTP endpoints — the layout's `requireAdmin`
 * does NOT cover us here, so we re-check on entry. All writes use the admin's
 * own session client, meaning the `content_blocks: admin write` RLS policy
 * from Phase 2 applies to every single row: a bug in this function cannot let
 * a non-admin write.
 *
 * `page` is validated against the registry so an unknown or crafted page name
 * can never sneak keys through — only fields whose registry entry lives on
 * that page are accepted.
 */
export async function saveInhaltePage(
  page: PageId,
  formData: FormData
): Promise<ContentSaveResult> {
  if (!PAGES.includes(page)) return { ok: false, error: "Unbekannter Bereich." };

  const session = await requireAdmin();
  const allowed = CONTENT_REGISTRY.filter((f) => f.page === page);
  const rows: FieldRow[] = [];

  for (const field of allowed) {
    const row: FieldRow = { key: field.key, kind: field.kind, updated_by: session.userId };

    if (field.kind === "image") {
      row.image_path = normalisePath(formData.get(`${field.key}::path`));
      row.image_alt_de = normaliseString(formData.get(`${field.key}::alt_de`));
      row.image_alt_en = normaliseString(formData.get(`${field.key}::alt_en`));
      row.image_alt_fr = normaliseString(formData.get(`${field.key}::alt_fr`));
      row.focal_x = clampFocal(formData.get(`${field.key}::focal_x`), 50);
      row.focal_y = clampFocal(formData.get(`${field.key}::focal_y`), 50);
      row.zoom = clampZoom(formData.get(`${field.key}::zoom`));
    } else {
      for (const loc of LOCALES) {
        const raw = formData.get(`${field.key}::${loc}`);
        if (raw === null) continue;
        const text = normaliseText(raw);
        // Hard sanity cap: 10× the advisory maxLength (or 20 000 chars for
        // fields without a limit) blocks a runaway copy-paste. Everything
        // inside the advisory limit is fine.
        const cap = (field.maxLength ?? 2000) * 10;
        if (text && text.length > cap) {
          return {
            ok: false,
            error: `Der Text im Feld „${field.label}" ist unrealistisch lang und wurde nicht gespeichert.`,
          };
        }
        setLocaleText(row, loc, text);
      }
    }

    rows.push(row);
  }

  if (rows.length === 0) return { ok: true };

  const { error } = await session.supabase
    .from("content_blocks")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    console.error("[admin/inhalte] upsert failed:", error);
    return {
      ok: false,
      error: "Speichern fehlgeschlagen. Bitte in einer Minute nochmals versuchen.",
    };
  }

  refreshPublicContent();
  return { ok: true };
}

// ── helpers ──────────────────────────────────────────────────────────────
function setLocaleText(row: FieldRow, loc: Loc, value: string | null): void {
  if (loc === "de") row.value_de = value;
  else if (loc === "en") row.value_en = value;
  else row.value_fr = value;
}

function normaliseText(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null;
  const str = String(raw).replace(/\r\n/g, "\n").trim();
  return str === "" ? null : str;
}

function normaliseString(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null;
  const trimmed = String(raw).trim();
  return trimmed === "" ? null : trimmed;
}

function clampFocal(raw: FormDataEntryValue | null, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
}

function clampZoom(raw: FormDataEntryValue | null): number {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(3, Math.max(1, n)) : 1;
}

function normalisePath(raw: FormDataEntryValue | null): string | null {
  const s = normaliseString(raw);
  if (!s) return null;
  // No absolute URLs — only bucket paths or the legacy `/Bilder/…` references
  // we still ship in `public/`. Mirrors what `mediaUrl()` knows how to resolve.
  if (/^https?:\/\//i.test(s)) return null;
  return s;
}
