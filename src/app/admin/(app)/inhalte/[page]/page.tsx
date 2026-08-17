import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { CONTENT_REGISTRY, type PageId } from "@/content/registry";
import { toImagePaths } from "@/lib/image-sizes";
import { ToastHost } from "@/lib/admin/toast";
import InhalteEditor, { type EditorField } from "../InhalteEditor";

const PAGE_LABELS: Record<PageId, string> = {
  global: "Global (Navigation & Fusszeile)",
  home: "Startseite",
  ueber: "Über uns",
  impressionen: "Impressionen (Kopf)",
  kontakt: "Kontakt",
  anmeldung: "Anmeldung (geschlossen)",
};

const KNOWN_PAGES = Object.keys(PAGE_LABELS) as PageId[];

export default async function InhaltePagePage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!KNOWN_PAGES.includes(page as PageId)) notFound();
  const pageId = page as PageId;

  const { supabase } = await requireAdmin();

  // "Unser Ansatz" only shows here while it's actually live on the site
  // (site_settings.ueber_ansatz_visible) — keeps the admin free of fields
  // for sections nobody can currently see (Claudio's ask, Aug 2026). The
  // registry entries themselves stay put; re-enabling the section in
  // Einstellungen brings the fields straight back, nothing to re-plumb.
  const showAnsatz =
    pageId !== "ueber" ||
    (await supabase.from("site_settings").select("ueber_ansatz_visible").maybeSingle()).data
      ?.ueber_ansatz_visible === true;

  const fields = CONTENT_REGISTRY.filter(
    (f) => f.page === pageId && (showAnsatz || !f.key.startsWith("ueber.ansatz."))
  );
  const keys = fields.map((f) => f.key);

  // Fetch straight through the admin's own client (RLS: public read on
  // content_blocks — always allowed). No cache: the admin must always see the
  // freshest values, otherwise a save-then-edit cycle would be confusing.
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select(
      "key,kind,value_de,value_en,value_fr,image_path,image_path_thumb,image_path_medium,image_alt_de,image_alt_en,image_alt_fr,focal_x,focal_y,zoom"
    )
    .in("key", keys);

  const byKey = new Map(blocks?.map((b) => [b.key, b]) ?? []);

  // Group by section, preserving registry order.
  const sectionMap = new Map<string, EditorField[]>();
  for (const field of fields) {
    const block = byKey.get(field.key);
    const editor: EditorField =
      field.kind === "image"
        ? {
            field,
            path: toImagePaths(
              block?.image_path ?? null,
              block?.image_path_thumb ?? null,
              block?.image_path_medium ?? null
            ),
            alts: {
              de: block?.image_alt_de ?? "",
              en: block?.image_alt_en ?? "",
              fr: block?.image_alt_fr ?? "",
            },
            focal: {
              focalX: block?.focal_x ?? 50,
              focalY: block?.focal_y ?? 50,
              zoom: block?.zoom ?? 1,
            },
          }
        : {
            field,
            texts: {
              de: block?.value_de ?? "",
              en: block?.value_en ?? "",
              fr: block?.value_fr ?? "",
            },
          };
    const list = sectionMap.get(field.section) ?? [];
    list.push(editor);
    sectionMap.set(field.section, list);
  }

  const sections = Array.from(sectionMap.entries()).map(([title, fields]) => ({ title, fields }));

  return (
    <ToastHost>
      <p className="a-page-lead" style={{ marginTop: 0 }}>
        <Link href="/admin/inhalte" style={{ color: "var(--color-text-muted)" }}>
          ← Alle Bereiche
        </Link>
      </p>
      <InhalteEditor page={pageId} pageLabel={PAGE_LABELS[pageId]} sections={sections} />
    </ToastHost>
  );
}
