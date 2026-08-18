"use client";

import { loadImage, drawResizedWebp, type ResizedImage } from "@/lib/media/resize";
import { SIZE_SPECS, type PhotoSize } from "./paths";

export interface ProcessedPhoto {
  variants: Record<PhotoSize, ResizedImage>;
  /** Tiny base64 data: URI for a blur-up placeholder — no extra network request. */
  blurDataUrl: string;
}

const BLUR_MAX_EDGE = 24;
const BLUR_QUALITY = 0.5;

/**
 * Decode a File once, then draw it at all three gallery sizes plus a tiny
 * blur placeholder. One decode instead of four — matters on the "weak
 * laptop, many photos" case the plan flags as a risk.
 *
 * Whatever EXIF the source file carried does not survive this: canvas
 * re-encoding drops every tag (including GPS) by construction, so the WebP
 * variants never carry the source's metadata. EXIF is read separately, only
 * for the year cascade — see `./exif.ts` — before this function ever runs.
 */
export async function processGalleryPhoto(file: File): Promise<ProcessedPhoto> {
  const source = await loadImage(file);

  const variants = {} as Record<PhotoSize, ResizedImage>;
  for (const spec of SIZE_SPECS) {
    variants[spec.size] = await drawResizedWebp(source, {
      maxEdge: spec.maxEdge,
      quality: spec.quality,
    });
  }

  const blur = await drawResizedWebp(source, { maxEdge: BLUR_MAX_EDGE, quality: BLUR_QUALITY });
  const blurDataUrl = await blobToDataUrl(blur.blob);

  return { variants, blurDataUrl };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Platzhalter konnte nicht erzeugt werden."));
    reader.readAsDataURL(blob);
  });
}
