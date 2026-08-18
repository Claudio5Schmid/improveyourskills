import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/BrandMark";

/**
 * Default link-preview image for every public page (WhatsApp, Facebook,
 * Slack, …) — there was none before Phase 7, so shares showed no image at
 * all. One shared image for the whole site, not per-page: keeps this a
 * "Grundgerüst" step, a route can add its own `opengraph-image.tsx` later
 * to override this for a specific page.
 *
 * Text uses the platform's built-in sans-serif, not self-hosted Syne — Syne
 * isn't available as raw font bytes to hand to Satori/ImageResponse without
 * a separate fetch, and this is a small share of the visual (the brand mark
 * + the two brand colours carry it). Revisit if Claudio wants this pixel-
 * perfect to the real wordmark.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#102C26",
        }}
      >
        <BrandMark box={160} />
        <div style={{ fontSize: 64, fontWeight: 700, color: "#F7E7CE", letterSpacing: -1 }}>
          Improve your skills
        </div>
      </div>
    ),
    size
  );
}
