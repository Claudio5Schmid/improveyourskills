"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { refreshPublicContent } from "@/lib/admin/revalidate";

export interface Result {
  ok: boolean;
  error?: string;
}

interface Settings {
  registration_open: boolean;
  current_edition_year: number;
  course_date: string | null;
  price_chf: number | null;
  contact_email: string | null;
  venue_name: string | null;
  venue_address: string | null;
  ueber_ansatz_visible: boolean;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function saveSettings(input: Settings): Promise<Result> {
  const { supabase, userId } = await requireAdmin();

  const year = Math.trunc(Number(input.current_edition_year));
  if (!Number.isFinite(year) || year < 2020 || year > 2100) {
    return { ok: false, error: "Jahr muss zwischen 2020 und 2100 liegen." };
  }

  const price = input.price_chf == null ? null : Number(input.price_chf);
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 10000)) {
    return { ok: false, error: "Preis muss eine positive Zahl sein." };
  }

  const email = input.contact_email?.trim() || null;
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "Kontakt-E-Mail ist ungültig." };
  }

  const date = input.course_date?.trim() || null;
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: "Datum bitte im Format JJJJ-MM-TT eingeben." };
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      registration_open: input.registration_open,
      current_edition_year: year,
      course_date: date,
      price_chf: price,
      contact_email: email,
      venue_name: input.venue_name?.trim() || null,
      venue_address: input.venue_address?.trim() || null,
      ueber_ansatz_visible: input.ueber_ansatz_visible,
      updated_by: userId,
    })
    .eq("id", true);

  if (error) {
    console.error("[admin/einstellungen]", error);
    return { ok: false, error: "Speichern fehlgeschlagen. Bitte in einer Minute nochmals versuchen." };
  }

  refreshPublicContent();
  return { ok: true };
}
