import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isStorageMedia, mediaUrl, mediaSrcSet } from "./url";

const ORIGINAL = process.env.NEXT_PUBLIC_SUPABASE_URL;

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ref.supabase.co";
});

afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL;
});

describe("mediaUrl", () => {
  it("returns null for empty input", () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl("")).toBeNull();
  });

  it("leaves an absolute URL alone", () => {
    expect(mediaUrl("https://example.com/x.jpg")).toBe("https://example.com/x.jpg");
  });

  it("leaves a legacy /Bilder/… path alone (Phase-1 images in public/)", () => {
    expect(mediaUrl("/Bilder/hero.jpg")).toBe("/Bilder/hero.jpg");
  });

  it("rewrites a bucket path to the storage CDN URL", () => {
    expect(mediaUrl("home/hero/x.webp")).toBe(
      "https://ref.supabase.co/storage/v1/object/public/media/home/hero/x.webp"
    );
  });

  it("percent-encodes each path segment", () => {
    expect(mediaUrl("home/hero/hase & fuchs.webp")).toBe(
      "https://ref.supabase.co/storage/v1/object/public/media/home/hero/hase%20%26%20fuchs.webp"
    );
  });
});

describe("mediaSrcSet", () => {
  it("builds all three candidates with their width descriptors, in size order", () => {
    expect(
      mediaSrcSet({ thumb: "x_thumb.webp", medium: "x_medium.webp", large: "x_large.webp" })
    ).toBe(
      "https://ref.supabase.co/storage/v1/object/public/media/x_thumb.webp 480w, " +
        "https://ref.supabase.co/storage/v1/object/public/media/x_medium.webp 1200w, " +
        "https://ref.supabase.co/storage/v1/object/public/media/x_large.webp 2000w"
    );
  });

  it("returns null for a pre-Phase-7 row that only has the large variant", () => {
    // Exactly the shape of every image_path/photo_path row before this
    // migration — thumb/medium are null until re-uploaded.
    expect(mediaSrcSet({ thumb: null, medium: null, large: "x_large.webp" })).toBeNull();
  });

  it("returns null when nothing is set at all", () => {
    expect(mediaSrcSet({ thumb: null, medium: null, large: null })).toBeNull();
  });

  it("still builds a two-candidate srcset if only one size is missing", () => {
    expect(mediaSrcSet({ thumb: "x_thumb.webp", medium: null, large: "x_large.webp" })).toBe(
      "https://ref.supabase.co/storage/v1/object/public/media/x_thumb.webp 480w, " +
        "https://ref.supabase.co/storage/v1/object/public/media/x_large.webp 2000w"
    );
  });
});

describe("isStorageMedia", () => {
  it("detects bucket paths but not URLs or /Bilder", () => {
    expect(isStorageMedia("home/hero.webp")).toBe(true);
    expect(isStorageMedia("/Bilder/x.jpg")).toBe(false);
    expect(isStorageMedia("https://example.com/x.jpg")).toBe(false);
    expect(isStorageMedia(null)).toBe(false);
    expect(isStorageMedia("")).toBe(false);
  });
});
