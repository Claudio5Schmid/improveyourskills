import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { CONTENT_REGISTRY, type PageId } from "@/content/registry";

const PAGE_LABELS: Record<PageId, string> = {
  global: "Global",
  home: "Startseite",
  ueber: "Über uns",
  impressionen: "Impressionen",
  kontakt: "Kontakt",
  anmeldung: "Anmeldung",
};

interface OpenPlaceholder {
  key: string;
  label: string;
  page: PageId;
  section: string;
  kind: "text" | "image";
}

/**
 * Dashboard.
 *
 * The banner is a promise the brief makes ("a dashboard banner listing every
 * unfilled placeholder"). It joins the typed registry with the DB and asks a
 * simple question per field: does this field currently have a German value
 * (for text) or an image path (for image)? If not, it counts as a placeholder
 * and shows here, with a direct link into the editor.
 */
export default async function AdminDashboardPage() {
  const { supabase, displayName } = await requireAdmin();

  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("key,value_de,image_path");

  const byKey = new Map(blocks?.map((b) => [b.key, b]) ?? []);
  const open: OpenPlaceholder[] = [];

  for (const field of CONTENT_REGISTRY) {
    const block = byKey.get(field.key);
    if (field.kind === "image") {
      if (!block?.image_path) {
        open.push({ key: field.key, label: field.label, page: field.page, section: field.section, kind: "image" });
      }
    } else {
      if (!block?.value_de || String(block.value_de).trim() === "") {
        open.push({ key: field.key, label: field.label, page: field.page, section: field.section, kind: "text" });
      }
    }
  }

  return (
    <>
      <p className="a-label">Willkommen, {displayName}</p>
      <h1 className="a-page-title">Übersicht</h1>
      <p className="a-page-lead">
        Alle Änderungen sind sofort live — es gibt keinen Entwurfsmodus, keine Freigabe.
      </p>

      <div className={`a-notice ${open.length > 0 ? "a-notice-warn" : ""}`} style={{ marginTop: "var(--space-15)" }}>
        {open.length === 0 ? (
          <>
            <h2>Alle Platzhalter gefüllt</h2>
            <p>Keine leeren Text- oder Bildfelder. Gut so.</p>
          </>
        ) : (
          <>
            <h2>
              Offene Platzhalter{" "}
              <span className="a-badge a-badge-warn">{open.length}</span>
            </h2>
            <p>
              Diese Felder sind noch leer. Auf der öffentlichen Seite bleibt entweder das alte
              Beispielbild sichtbar oder der Text fällt zurück.
            </p>
            <ul>
              {open.map((p) => (
                <li key={p.key}>
                  <Link href={`/admin/inhalte/${p.page}`}>
                    {PAGE_LABELS[p.page]} · {p.section} · {p.label}
                  </Link>{" "}
                  <span className="a-badge">{p.kind === "image" ? "Bild" : "Text"}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
