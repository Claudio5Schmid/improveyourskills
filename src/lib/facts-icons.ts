import {
  Calendar,
  MapPin,
  Users,
  Banknote,
  ClipboardCheck,
  Clock,
  Mail,
  Info,
  type LucideIcon,
} from "lucide-react";

/**
 * Fixed icon set for the homepage "Eckdaten" facts (Block E). Deliberately a
 * closed list, not a free-text field — keeps the admin picker and the public
 * render in lockstep, and keeps every icon on-brand (same stroke width/scale
 * as the rest of the site, no emoji).
 */
export const FACT_ICONS = {
  calendar: { Icon: Calendar, label: "Kalender (Termin/Datum)" },
  "map-pin": { Icon: MapPin, label: "Pin (Ort)" },
  users: { Icon: Users, label: "Personen (Alter/Kategorie)" },
  banknote: { Icon: Banknote, label: "Geldschein (Kosten)" },
  "clipboard-check": { Icon: ClipboardCheck, label: "Checkliste (Anmeldung)" },
  clock: { Icon: Clock, label: "Uhr (Dauer)" },
  mail: { Icon: Mail, label: "Umschlag (Kontakt)" },
  info: { Icon: Info, label: "Info (Allgemein)" },
} as const satisfies Record<string, { Icon: LucideIcon; label: string }>;

export type FactIconKey = keyof typeof FACT_ICONS;

export const FACT_ICON_KEYS = Object.keys(FACT_ICONS) as FactIconKey[];

export function isFactIconKey(value: string): value is FactIconKey {
  return value in FACT_ICONS;
}
