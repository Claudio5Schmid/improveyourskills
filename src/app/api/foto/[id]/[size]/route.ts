import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isPhotoSize } from "@/lib/gallery/paths";

// Blob handling below relies on the Node runtime (not Edge).
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NOINDEX_HEADERS = { "X-Robots-Tag": "noindex, noimageindex, nofollow" };

interface PhotoPaths {
  path_thumb: string;
  path_medium: string;
  path_large: string;
}

/**
 * The only way a browser ever sees gallery bytes (brief §Phase 4). The
 * `gallery` storage bucket has NO public read policy at all — anon has zero
 * access to it — so this route is where "hidden" is actually enforced:
 *
 *  1. Query `gallery_photos` with the ANON client. RLS already restricts
 *     that to `hidden = false`, so getting nothing back means "doesn't
 *     exist" and "is hidden" — we deliberately can't tell those apart here,
 *     and neither should a visitor.
 *  2. Only once step 1 found a row do we reach for the service-role client
 *     (bypasses storage RLS) to pull the actual bytes.
 *
 * We stream the bytes ourselves — rather than redirecting to a signed
 * Supabase URL — specifically so this response carries OUR headers
 * (X-Robots-Tag, long immutable Cache-Control). A redirect would hand the
 * browser off to Supabase's own response headers instead, silently losing
 * the noindex protection the brief requires.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; size: string }> }
) {
  const { id, size } = await params;

  if (!UUID_RE.test(id) || !isPhotoSize(size)) {
    return notFound();
  }

  const publicClient = createPublicClient();
  const { data: photo } = await publicClient
    .from("gallery_photos")
    .select("path_thumb,path_medium,path_large")
    .eq("id", id)
    .maybeSingle();

  const row = photo as PhotoPaths | null;
  const path = row && { thumb: row.path_thumb, medium: row.path_medium, large: row.path_large }[size];
  if (!path) return notFound();

  const service = createServiceRoleClient();
  const { data: blob, error } = await service.storage.from("gallery").download(path);
  if (error || !blob) {
    console.error("[api/foto] download failed:", path, error?.message);
    return notFound();
  }

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "image/webp",
      // Filenames are content-addressed (a fresh UUID per upload) and never
      // mutated in place, so a long, immutable cache lifetime is safe — this
      // is also what keeps the per-image Vercel function call rare (plan
      // §Phase 4 risk note), since the edge cache answers repeat requests.
      "Cache-Control": "public, max-age=31536000, immutable",
      ...NOINDEX_HEADERS,
    },
  });
}

function notFound(): NextResponse {
  return new NextResponse("Not found", { status: 404, headers: NOINDEX_HEADERS });
}
