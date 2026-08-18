import { describe, expect, it } from "vitest";
import { toImagePaths, isImageSize, SIZE_SPECS, IMAGE_SIZES } from "./image-sizes";

describe("toImagePaths", () => {
  it("returns null when there's no large variant, even if thumb/medium are set", () => {
    // Shouldn't happen in practice, but a stray thumb/medium with no large
    // must still read as "no image" — every caller keys off `large`.
    expect(toImagePaths(null, "t.webp", "m.webp")).toBeNull();
  });

  it("builds the object once large is set, keeping thumb/medium as-is", () => {
    expect(toImagePaths("l.webp", "t.webp", "m.webp")).toEqual({
      thumb: "t.webp",
      medium: "m.webp",
      large: "l.webp",
    });
  });

  it("builds the object with null thumb/medium for a pre-Phase-7 row", () => {
    expect(toImagePaths("l.webp", null, null)).toEqual({
      thumb: null,
      medium: null,
      large: "l.webp",
    });
  });
});

describe("SIZE_SPECS / IMAGE_SIZES", () => {
  it("matches the brief exactly: thumb 480/q72, medium 1200/q78, large 2000/q80", () => {
    expect(SIZE_SPECS).toEqual([
      { size: "thumb", maxEdge: 480, quality: 0.72 },
      { size: "medium", maxEdge: 1200, quality: 0.78 },
      { size: "large", maxEdge: 2000, quality: 0.8 },
    ]);
  });

  it("keeps IMAGE_SIZES and SIZE_SPECS in the same order", () => {
    expect(IMAGE_SIZES).toEqual(SIZE_SPECS.map((s) => s.size));
  });
});

describe("isImageSize", () => {
  it("accepts only the three real sizes", () => {
    expect(isImageSize("thumb")).toBe(true);
    expect(isImageSize("medium")).toBe(true);
    expect(isImageSize("large")).toBe(true);
    expect(isImageSize("xlarge")).toBe(false);
    expect(isImageSize("")).toBe(false);
  });
});
