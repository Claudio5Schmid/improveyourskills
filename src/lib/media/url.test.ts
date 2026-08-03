import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isStorageMedia, mediaUrl } from "./url";

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

describe("isStorageMedia", () => {
  it("detects bucket paths but not URLs or /Bilder", () => {
    expect(isStorageMedia("home/hero.webp")).toBe(true);
    expect(isStorageMedia("/Bilder/x.jpg")).toBe(false);
    expect(isStorageMedia("https://example.com/x.jpg")).toBe(false);
    expect(isStorageMedia(null)).toBe(false);
    expect(isStorageMedia("")).toBe(false);
  });
});
