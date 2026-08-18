import { unstable_cache } from "next/cache";
import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { mediaUrl, mediaSrcSet } from "@/lib/media/url";
import type { Locale } from "@/i18n/routing";

export interface SiteSettings {
  registration_open: boolean;
  current_edition_year: number;
  course_date: string | null;
  price_chf: number | null;
  contact_email: string | null;
  venue_name: string | null;
  venue_address: string | null;
  ueber_ansatz_visible: boolean;
}

export interface ContentBlock {
  key: string;
  kind: string;
  value_de: string | null;
  value_en: string | null;
  value_fr: string | null;
  image_path: string | null;
  image_path_thumb: string | null;
  image_path_medium: string | null;
  image_alt_de: string | null;
  image_alt_en: string | null;
  image_alt_fr: string | null;
  focal_x: number;
  focal_y: number;
  zoom: number;
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
  photo_path_thumb: string | null;
  photo_path_medium: string | null;
  focal_x: number;
  focal_y: number;
  zoom: number;
}

export interface CarouselImage {
  id: string;
  sort_order: number;
  image_path: string | null;
  image_path_thumb: string | null;
  image_path_medium: string | null;
  alt_de: string | null;
  alt_en: string | null;
  alt_fr: string | null;
  focal_x: number;
  focal_y: number;
  zoom: number;
}

export interface StatRow {
  id: string;
  sort_order: number;
  value: string;
  label_de: string | null;
  label_en: string | null;
  label_fr: string | null;
}

export interface TestimonialRow {
  id: string;
  sort_order: number;
  quote_de: string | null;
  quote_en: string | null;
  quote_fr: string | null;
  author_name: string | null;
  author_role_de: string | null;
  author_role_en: string | null;
  author_role_fr: string | null;
}

export type HomeFactStatus = "set" | "open" | "soon";

export interface HomeFactRow {
  id: string;
  sort_order: number;
  icon: string;
  label_de: string;
  label_en: string | null;
  label_fr: string | null;
  status: HomeFactStatus;
  value_de: string | null;
  value_en: string | null;
  value_fr: string | null;
}

interface SiteContent {
  blocks: ContentBlock[];
  settings: SiteSettings | null;
  team: TeamMember[];
  carousel: CarouselImage[];
  stats: StatRow[];
  testimonials: TestimonialRow[];
  homeFacts: HomeFactRow[];
}

const EMPTY: SiteContent = {
  blocks: [],
  settings: null,
  team: [],
  carousel: [],
  stats: [],
  testimonials: [],
  homeFacts: [],
};

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
    const [blocks, settings, team, carousel, stats, testimonials, homeFacts] = await Promise.all([
      sb
        .from("content_blocks")
        .select(
          "key,kind,value_de,value_en,value_fr,image_path,image_path_thumb,image_path_medium,image_alt_de,image_alt_en,image_alt_fr,focal_x,focal_y,zoom"
        ),
      sb.from("site_settings").select("*").limit(1).maybeSingle(),
      sb
        .from("team_members")
        .select(
          "id,sort_order,name,role_de,role_en,role_fr,extra_de,extra_en,extra_fr,photo_path,photo_path_thumb,photo_path_medium,focal_x,focal_y,zoom"
        )
        .order("sort_order"),
      sb
        .from("carousel_images")
        .select(
          "id,sort_order,image_path,image_path_thumb,image_path_medium,alt_de,alt_en,alt_fr,focal_x,focal_y,zoom"
        )
        .order("sort_order"),
      // RLS already restricts anon reads to visible=true (same pattern as
      // gallery_photos) — no client-side filter needed here.
      sb.from("stats").select("id,sort_order,value,label_de,label_en,label_fr").order("sort_order"),
      sb
        .from("testimonials")
        .select(
          "id,sort_order,quote_de,quote_en,quote_fr,author_name,author_role_de,author_role_en,author_role_fr"
        )
        .order("sort_order"),
      sb
        .from("home_facts")
        .select(
          "id,sort_order,icon,label_de,label_en,label_fr,status,value_de,value_en,value_fr"
        )
        .order("sort_order"),
    ]);
    return {
      blocks: (blocks.data as ContentBlock[] | null) ?? [],
      settings: (settings.data as SiteSettings | null) ?? null,
      team: (team.data as TeamMember[] | null) ?? [],
      carousel: (carousel.data as CarouselImage[] | null) ?? [],
      stats: (stats.data as StatRow[] | null) ?? [],
      testimonials: (testimonials.data as TestimonialRow[] | null) ?? [],
      homeFacts: (homeFacts.data as HomeFactRow[] | null) ?? [],
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

// Re-export so existing imports (`from "@/content/content"`) keep working.
export { formatPrice, formatCourseDate } from "./format";
import { formatPrice as fmtPrice, interpolateContent } from "./format";

function interpolate(text: string, settings: SiteSettings): string {
  return interpolateContent(text, {
    year: settings.current_edition_year,
    price: fmtPrice(settings.price_chf),
  });
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
  /** Responsive candidates for the same image (thumb/medium/large) — null
      until the row has at least two sizes stored (Phase 7). */
  srcSet: string | null;
  alt: string;
  focalX: number;
  focalY: number;
  zoom: number;
}

/** Map of image content_blocks by key, with the localised alt text. */
export async function getImageMap(locale: Locale): Promise<Record<string, LocalizedImage>> {
  const { blocks } = await getSiteContent();
  const altColumn = `image_alt_${locale}` as "image_alt_de" | "image_alt_en" | "image_alt_fr";
  const map: Record<string, LocalizedImage> = {};
  for (const block of blocks) {
    if (block.kind !== "image") continue;
    map[block.key] = {
      src: mediaUrl(block.image_path),
      srcSet: mediaSrcSet({
        thumb: block.image_path_thumb,
        medium: block.image_path_medium,
        large: block.image_path,
      }),
      alt: block[altColumn] ?? block.image_alt_de ?? "",
      focalX: block.focal_x,
      focalY: block.focal_y,
      zoom: block.zoom,
    };
  }
  return map;
}

export interface LocalizedTeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  photoSrcSet: string | null;
  focalX: number;
  focalY: number;
  zoom: number;
}

export async function getTeam(locale: Locale): Promise<LocalizedTeamMember[]> {
  const { team } = await getSiteContent();
  const roleCol = `role_${locale}` as "role_de" | "role_en" | "role_fr";
  const extraCol = `extra_${locale}` as "extra_de" | "extra_en" | "extra_fr";
  return team.map((m) => ({
    name: m.name,
    role: m[roleCol] ?? m.role_de ?? "",
    bio: m[extraCol] ?? m.extra_de ?? "",
    focalX: m.focal_x,
    focalY: m.focal_y,
    zoom: m.zoom,
    photo: mediaUrl(m.photo_path),
    photoSrcSet: mediaSrcSet({
      thumb: m.photo_path_thumb,
      medium: m.photo_path_medium,
      large: m.photo_path,
    }),
  }));
}

export async function getCarousel(locale: Locale): Promise<LocalizedImage[]> {
  const { carousel } = await getSiteContent();
  const altCol = `alt_${locale}` as "alt_de" | "alt_en" | "alt_fr";
  return carousel
    .filter((c) => c.image_path)
    .map((c) => ({
      src: mediaUrl(c.image_path),
      srcSet: mediaSrcSet({
        thumb: c.image_path_thumb,
        medium: c.image_path_medium,
        large: c.image_path,
      }),
      alt: c[altCol] ?? c.alt_de ?? "",
      focalX: c.focal_x,
      focalY: c.focal_y,
      zoom: c.zoom,
    }));
}

export async function getSettings(): Promise<SiteSettings | null> {
  return (await getSiteContent()).settings;
}

export interface LocalizedStat {
  value: string;
  label: string;
}

export async function getStats(locale: Locale): Promise<LocalizedStat[]> {
  const { stats } = await getSiteContent();
  const labelCol = `label_${locale}` as "label_de" | "label_en" | "label_fr";
  return stats.map((s) => ({ value: s.value, label: s[labelCol] ?? s.label_de ?? "" }));
}

export interface LocalizedTestimonial {
  quote: string;
  authorName: string;
  authorRole: string;
}

export async function getTestimonials(locale: Locale): Promise<LocalizedTestimonial[]> {
  const { testimonials } = await getSiteContent();
  const quoteCol = `quote_${locale}` as "quote_de" | "quote_en" | "quote_fr";
  const roleCol = `author_role_${locale}` as "author_role_de" | "author_role_en" | "author_role_fr";
  return testimonials
    .map((t) => ({
      quote: t[quoteCol] ?? t.quote_de ?? "",
      authorName: t.author_name ?? "",
      authorRole: t[roleCol] ?? t.author_role_de ?? "",
    }))
    .filter((t) => t.quote.trim() !== "");
}

export interface LocalizedHomeFact {
  icon: string;
  label: string;
  status: HomeFactStatus;
  value: string;
}

export async function getHomeFacts(locale: Locale): Promise<LocalizedHomeFact[]> {
  const { homeFacts } = await getSiteContent();
  const labelCol = `label_${locale}` as "label_de" | "label_en" | "label_fr";
  const valueCol = `value_${locale}` as "value_de" | "value_en" | "value_fr";
  return homeFacts.map((f) => ({
    icon: f.icon,
    label: f[labelCol] ?? f.label_de,
    status: f.status,
    value: f[valueCol] ?? f.value_de ?? "",
  }));
}

// formatPrice / formatCourseDate are re-exported from ./format at the top of
// this file — the definitions moved there so they can be unit-tested without
// dragging in Next's cache machinery.
