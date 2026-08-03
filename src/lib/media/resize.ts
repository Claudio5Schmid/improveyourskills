/**
 * Client-side image resize + WebP encode.
 *
 * Why this exists: Supabase's image transformation is a paid add-on we chose
 * not to use (CLAUDE.md). So every upload is compressed in the browser first —
 * one file goes up, no server work, no CDN transform bill. The visible admin
 * upload therefore never blocks on the network for more than the size of the
 * finished WebP, and page loads on the public site always fetch a modern
 * format sized for the layout.
 *
 * The resize target only shrinks (never enlarges) and preserves aspect ratio.
 * Encoded through <canvas>, which is fine for the sizes we care about
 * (hero images ~2000px, thumbnails ~480px) and does not need any dependency.
 */

export interface ResizeOptions {
  /** Longest edge in pixels. The other dimension follows the aspect ratio. */
  maxEdge: number;
  /** 0…1 — 0.82 is a good default for photos, indistinguishable from source. */
  quality?: number;
}

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
  mime: "image/webp";
  bytes: number;
}

const DEFAULT_QUALITY = 0.82;

/** Best-effort MIME check — belt to the RLS/bucket braces. */
export function isSupportedImage(file: File): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(file.type);
}

/**
 * Load a File into an HTMLImageElement, honouring EXIF rotation so portrait
 * phone photos don't come out sideways.
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function resizeToWebp(file: File, options: ResizeOptions): Promise<ResizedImage> {
  const quality = options.quality ?? DEFAULT_QUALITY;
  const source = await loadImage(file);

  const longest = Math.max(source.naturalWidth, source.naturalHeight);
  const scale = longest > options.maxEdge ? options.maxEdge / longest : 1;
  const width = Math.max(1, Math.round(source.naturalWidth * scale));
  const height = Math.max(1, Math.round(source.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", quality);
  });
  if (!blob) throw new Error("WebP-Kodierung fehlgeschlagen.");

  return { blob, width, height, mime: "image/webp", bytes: blob.size };
}

/**
 * Content-blocks media (hero, WWM, page headers, team photos, carousel).
 * One size is enough for now — the responsive-loader work is Phase 7.
 * 2000 px on the long edge is generous for a hero on a 2× display and still
 * lands comfortably inside the bucket's 5 MB limit at q=0.82.
 */
export function resizeContentImage(file: File): Promise<ResizedImage> {
  return resizeToWebp(file, { maxEdge: 2000 });
}
