import Link from "next/link";
import { registryByPage, type PageId } from "@/content/registry";

const PAGE_LABELS: Record<PageId, string> = {
  global: "Global (Navigation & Fusszeile)",
  home: "Startseite",
  ueber: "Über uns",
  impressionen: "Impressionen (Kopf)",
  kontakt: "Kontakt",
  anmeldung: "Anmeldung (geschlossen)",
};

/** Page picker — the actual editing lives at /admin/inhalte/[page]. */
export default function InhalteIndexPage() {
  const grouped = registryByPage();
  const pages = (Object.keys(PAGE_LABELS) as PageId[]).filter((p) => grouped[p]);

  return (
    <>
      <p className="a-label">Inhalte</p>
      <h1 className="a-page-title">Was möchtest du bearbeiten?</h1>
      <p className="a-page-lead">
        Wähle einen Bereich. Änderungen sind sofort auf der Website sichtbar; DE ist Pflicht,
        EN und FR fallen automatisch auf Deutsch zurück.
      </p>

      <ul className="a-list" style={{ marginTop: "var(--space-15)" }}>
        {pages.map((page) => {
          const count = Object.values(grouped[page]).reduce((sum, f) => sum + f.length, 0);
          return (
            <li key={page} className="a-list-item">
              <div>
                <strong>{PAGE_LABELS[page]}</strong>
                <br />
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm4)" }}>
                  {count} Feld{count === 1 ? "" : "er"}
                </span>
              </div>
              <Link href={`/admin/inhalte/${page}`} className="a-btn a-btn-sm">
                Öffnen
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
