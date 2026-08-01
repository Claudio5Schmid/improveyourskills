import { unstable_cache } from "next/cache";
import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

export interface SiteSettings {
  registration_open: boolean;
  current_edition_year: number;
  course_date: string | null;
  price_chf: number | null;
  contact_email: string | null;
  venue_name: string | null;
  venue_address: string | null;
}

export interface ContentBlock {
  key: string;
  kind: string;
  value_de: string | null;
  value_en: string | null;
  value_fr: string | null;
  image_path: string | null;
  image_alt_de: string | null;
  image_alt_en: string | null;
  image_alt_fr: string | null;
}

export interface TeamMember {
  id: string;
  sort_order: number;
  name: string;
  role_de: string | null;
  role_en: string | null;
  role_fr: string | null;
  extra_de: string | null;
  extra_en: string | null;
  extra_fr: string | null;
  photo_path: string | null;
}

export interface CarouselImage {
  id: string;
  sort_order: number;
  image_path: string | null;
  alt_de: string | null;
  alt_en: string | null;
  alt_fr: string | null;
}

interface SiteContent {
  blocks: ContentBlock[];
  settings: SiteSettings | null;
  team: TeamMember[];
  carousel: CarouselImage[];
}

const EMPTY: SiteContent = { blocks: [], settings: null, team: [], carousel: [] };

/**
 * One cached read of all public content. Revalidates every 5 minutes and is
 * tagged "content" so the admin can trigger an on-demand refresh on save
 * (Phase 3). Resilient: if the DB is unreachable or unconfigured, returns empty
 * and the site falls back to the bundled German copy.
 */
async function fetchSiteContent(): Promise<SiteContent> {
  if (!hasSupabaseEnv()) return EMPTY;
  try {
    const sb = createPublicClient();
    const [blocks, settings, team, carousel] = await Promise.all([
      sb
        .from("content_blocks")
        .select(
          "key,kind,value_de,value_en,value_fr,image_path,image_alt_de,image_alt_en,image_alt_fr"
        ),
      sb.from("site_settings").select("*").limit(1).maybeSingle(),
      sb
        .from("team_members")
        .select("id,sort_order,name,role_de,role_en,role_fr,extra_de,extra_en,extra_fr,photo_path")
        .order("sort_order"),
      sb
        .from("carousel_images")
        .select("id,sort_order,image_path,alt_de,alt_en,alt_fr")
        .order("sort_order"),
    ]);
    return {
      blocks: (blocks.data as ContentBlock[] | null) ?? [],
      settings: (settings.data as SiteSettings | null) ?? null,
      team: (team.data as TeamMember[] | null) ?? [],
      carousel: (carousel.data as CarouselImage[] | null) ?? [],
    };
  } catch {
    return EMPTY;
  }
}

export const getSiteContent = unstable_cache(fetchSiteContent, ["site-content-v1"], {
  revalidate: 300,
  tags: ["content"],
});

// ── Placeholder interpolation (brief §2.4) ───────────────────────────────────

/** Format a franc amount the Swiss way: whole francs as "48.–", else "48.50". */
export function formatPrice(chf: number | null): string {
  if (chf == null) return "";
  const n = Number(chf);
  return Number.isInteger(n) ? `${n}.–` : n.toFixed(2);
}

function interpolate(text: string, settings: SiteSettings): string {
  const year = settings.current_edition_year;
  return text
    .replaceAll("{year}", String(year))
    .replaceAll("{nextYear}", String(year + 1))
    .replaceAll("{price}", formatPrice(settings.price_chf));
}

function setNested(root: Record<string, unknown>, key: string, value: string): void {
  const parts = key.split(".");
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof node[part] !== "object" || node[part] === null) node[part] = {};
    node = node[part] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}

/**
 * Build a next-intl messages object from the text content blocks, nested by
 * their dotted keys, with placeholders filled and per-locale fallback to
 * German. Image blocks are handled separately (passed to components as props),
 * so they are skipped here.
 */
export async function getDbContentMessages(locale: Locale): Promise<Record<string, unknown>> {
  const { blocks, settings } = await getSiteContent();
  if (!settings || blocks.length === 0) return {};

  const column = `value_${locale}` as "value_de" | "value_en" | "value_fr";
  const root: Record<string, unknown> = {};
  for (const block of blocks) {
    if (block.kind === "image") continue;
    const raw = block[column] ?? block.value_de;
    if (raw == null || raw === "") continue;
    setNested(root, block.key, interpolate(raw, settings));
  }
  return root;
}

// ── Localised accessors for images / rows / settings ─────────────────────────

export interface LocalizedImage {
  src: string | null;
  alt: string;
}

/** Map of image content_blocks by key, with the localised alt text. */
export async function getImageMap(locale: Locale): Promise<Record<string, LocalizedImage>> {
  const { blocks } = await getSiteContent();
  const altColumn = `image_alt_${locale}` as "image_alt_de" | "image_alt_en" | "image_alt_fr";
  const map: Record<string, LocalizedImage> = {};
  for (const block of blocks) {
    if (block.kind !== "image") continue;
    map[block.key] = { src: block.image_path, alt: block[altColumn] ?? block.image_alt_de ?? "" };
  }
  return map;
}

export interface LocalizedTeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string | null;
}

export async function getTeam(locale: Locale): Promise<LocalizedTeamMember[]> {
  const { team } = await getSiteContent();
  const roleCol = `role_${locale}` as "role_de" | "role_en" | "role_fr";
  const extraCol = `extra_${locale}` as "extra_de" | "extra_en" | "extra_fr";
  return team.map((m) => ({
    name: m.name,
    role: m[roleCol] ?? m.role_de ?? "",
    bio: m[extraCol] ?? m.extra_de ?? "",
    photo: m.photo_path,
  }));
}

export async function getCarousel(locale: Locale): Promise<LocalizedImage[]> {
  const { carousel } = await getSiteContent();
  const altCol = `alt_${locale}` as "alt_de" | "alt_en" | "alt_fr";
  return carousel
    .filter((c) => c.image_path)
    .map((c) => ({ src: c.image_path, alt: c[altCol] ?? c.alt_de ?? "" }));
}

export async function getSettings(): Promise<SiteSettings | null> {
  return (await getSiteContent()).settings;
}

/** Format the course date the way the old site showed it: "So, 5. Juli 2026". */
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
