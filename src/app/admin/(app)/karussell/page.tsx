import { requireAdmin } from "@/lib/admin/auth";
import { ToastHost } from "@/lib/admin/toast";
import KarussellEditor, { type CarouselRow } from "./KarussellEditor";

export default async function KarussellPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("carousel_images")
    .select("id,sort_order,image_path,alt_de,alt_en,alt_fr,visible")
    .order("sort_order");

  return (
    <ToastHost>
      <KarussellEditor initialImages={(data as CarouselRow[] | null) ?? []} />
    </ToastHost>
  );
}
