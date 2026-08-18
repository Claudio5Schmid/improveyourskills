import { describe, expect, it } from "vitest";
import { galleryYears, type GalleryPhoto } from "./data";

function photo(year: number): GalleryPhoto {
  return {
    id: `id-${year}-${Math.random()}`,
    year,
    sortOrder: 0,
    blurDataUrl: null,
    thumb: { width: 100, height: 100 },
    medium: { width: 100, height: 100 },
    large: { width: 100, height: 100 },
  };
}

describe("galleryYears", () => {
  it("returns distinct years, newest first", () => {
    const photos = [photo(2024), photo(2026), photo(2025), photo(2026)];
    expect(galleryYears(photos)).toEqual([2026, 2025, 2024]);
  });

  it("returns an empty array for no photos", () => {
    expect(galleryYears([])).toEqual([]);
  });
});
