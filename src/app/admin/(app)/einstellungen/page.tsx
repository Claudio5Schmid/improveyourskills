import { requireAdmin } from "@/lib/admin/auth";
import { ToastHost } from "@/lib/admin/toast";
import SettingsEditor, { type SettingsRow } from "./SettingsEditor";

const FALLBACK: SettingsRow = {
  registration_open: false,
  current_edition_year: new Date().getFullYear(),
  course_date: null,
  price_chf: null,
  contact_email: null,
  venue_name: null,
  venue_address: null,
  ueber_ansatz_visible: false,
};

export default async function EinstellungenPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").maybeSingle();
  const initial = (data as SettingsRow | null) ?? FALLBACK;

  return (
    <ToastHost>
      <SettingsEditor initial={initial} />
    </ToastHost>
  );
}
