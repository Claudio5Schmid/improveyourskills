import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { CONTENT_REGISTRY, type PageId } from "@/content/registry";
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

  const fields = CONTENT_REGISTRY.filter((f) => f.page === pageId);
  const keys = fields.map((f) => f.key);

  // Fetch straight through the admin's own client (RLS: public read on
  // content_blocks — always allowed). No cache: the admin must always see the
  // freshest values, otherwise a save-then-edit cycle would be confusing.
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select(
      "key,kind,value_de,value_en,value_fr,image_path,image_alt_de,image_alt_en,image_alt_fr"
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
            path: block?.image_path ?? null,
            alts: {
              de: block?.image_alt_de ?? "",
              en: block?.image_alt_en ?? "",
              fr: block?.image_alt_fr ?? "",
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
