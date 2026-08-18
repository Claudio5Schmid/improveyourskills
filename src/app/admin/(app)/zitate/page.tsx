import { requireAdmin } from "@/lib/admin/auth";
import { ToastHost } from "@/lib/admin/toast";
import ZitateEditor, { type StatRow, type TestimonialRow } from "./ZitateEditor";

export default async function ZitatePage() {
  const { supabase } = await requireAdmin();

  const [testimonials, stats] = await Promise.all([
    supabase
      .from("testimonials")
      .select(
        "id,sort_order,quote_de,quote_en,quote_fr,author_name,author_role_de,author_role_en,author_role_fr,visible"
      )
      .order("sort_order"),
    supabase
      .from("stats")
      .select("id,sort_order,value,label_de,label_en,label_fr,visible")
      .order("sort_order"),
  ]);

  return (
    <ToastHost>
      <ZitateEditor
        initialTestimonials={(testimonials.data as TestimonialRow[] | null) ?? []}
        initialStats={(stats.data as StatRow[] | null) ?? []}
      />
    </ToastHost>
  );
}
