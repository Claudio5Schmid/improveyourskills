import { requireAdmin } from "@/lib/admin/auth";
import { ToastHost } from "@/lib/admin/toast";
import EckdatenEditor, { type FactRow } from "./EckdatenEditor";

export default async function EckdatenPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("home_facts")
    .select("id,sort_order,icon,label_de,label_en,label_fr,status,value_de,value_en,value_fr,visible")
    .order("sort_order");

  return (
    <ToastHost>
      <EckdatenEditor initial={(data as FactRow[] | null) ?? []} />
    </ToastHost>
  );
}
