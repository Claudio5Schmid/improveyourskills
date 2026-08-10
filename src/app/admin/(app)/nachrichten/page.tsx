import { requireAdmin } from "@/lib/admin/auth";
import NachrichtenList, { type ContactMessageRow } from "./NachrichtenList";

export default async function NachrichtenPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("contact_messages")
    .select("id,first_name,last_name,email,message,locale,created_at,read_at,email_delivery_status")
    .order("created_at", { ascending: false });

  return (
    <>
      <p className="a-label">Verwaltung</p>
      <h1 className="a-page-title">Nachrichten</h1>
      <p className="a-page-lead">Eingänge aus dem Kontaktformular, neueste zuerst.</p>

      <NachrichtenList initialMessages={(data as ContactMessageRow[] | null) ?? []} />
    </>
  );
}
