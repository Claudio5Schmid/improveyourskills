import { describe, expect, it } from "vitest";
import { galleryObjectPath, isPhotoSize, PHOTO_SIZES, SIZE_SPECS } from "./paths";

describe("galleryObjectPath", () => {
  it("matches the brief's exact shape: gallery/{year}/{uuid}_{size}.webp", () => {
    expect(galleryObjectPath(2026, "abc-123", "thumb")).toBe("gallery/2026/abc-123_thumb.webp");
    expect(galleryObjectPath(2026, "abc-123", "medium")).toBe("gallery/2026/abc-123_medium.webp");
    expect(galleryObjectPath(2026, "abc-123", "large")).toBe("gallery/2026/abc-123_large.webp");
  });
});

describe("isPhotoSize", () => {
  it("accepts only the three known sizes", () => {
    expect(isPhotoSize("thumb")).toBe(true);
    expect(isPhotoSize("medium")).toBe(true);
    expect(isPhotoSize("large")).toBe(true);
  });

  it("rejects anything else, including path traversal attempts", () => {
    // The route handler builds a storage path from this value — must reject
    // anything that isn't an exact known literal.
    expect(isPhotoSize("original")).toBe(false);
    expect(isPhotoSize("")).toBe(false);
    expect(isPhotoSize("../thumb")).toBe(false);
    expect(isPhotoSize("thumb.webp")).toBe(false);
  });
});

describe("SIZE_SPECS", () => {
  it("matches the brief's sizes and quality settings exactly", () => {
    expect(SIZE_SPECS).toEqual([
      { size: "thumb", maxEdge: 480, quality: 0.72 },
      { size: "medium", maxEdge: 1200, quality: 0.78 },
      { size: "large", maxEdge: 2000, quality: 0.8 },
    ]);
  });

  it("covers every PhotoSize exactly once", () => {
    const sizes = SIZE_SPECS.map((s) => s.size).sort();
    expect(sizes).toEqual([...PHOTO_SIZES].sort());
  });
});
