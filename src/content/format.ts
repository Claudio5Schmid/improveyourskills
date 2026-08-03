/**
 * Pure formatters lifted out of `content.ts` so they can be tested without
 * pulling in Supabase + Next's cache machinery.
 *
 * These match the exact wording of the old hand-written site — the goal of
 * Phase 2 was to make the copy editable, not to reword it.
 */

/** "48.–" for whole francs, "48.50" for fractions, "" for null. */
export function formatPrice(chf: number | null): string {
  if (chf == null) return "";
  const n = Number(chf);
  return Number.isInteger(n) ? `${n}.–` : n.toFixed(2);
}

/** "So, 5. Juli 2026" from an ISO date string. */
export function formatCourseDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const weekday = new Intl.DateTimeFormat("de-CH", { weekday: "short" })
    .format(d)
    .replace(/\.$/, "");
  const rest = new Intl.DateTimeFormat("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  return `${weekday}, ${rest}`;
}

/** Interpolate `{year}`, `{nextYear}`, `{price}` from site_settings-derived values. */
export function interpolateContent(
  text: string,
  values: { year: number; price: string }
): string {
  return text
    .replaceAll("{year}", String(values.year))
    .replaceAll("{nextYear}", String(values.year + 1))
    .replaceAll("{price}", values.price);
}
