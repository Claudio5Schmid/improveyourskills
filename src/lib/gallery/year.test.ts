import { describe, expect, it } from "vitest";
import { pickPhotoYear } from "./year";

describe("pickPhotoYear (EXIF → file date → current edition, brief §Phase 4)", () => {
  it("prefers the EXIF date when present", () => {
    expect(
      pickPhotoYear({
        exifDate: new Date("2025-07-05"),
        fileLastModified: new Date("2026-01-01"),
        currentEditionYear: 2026,
      })
    ).toBe(2025);
  });

  it("falls back to the file's last-modified date when EXIF is missing", () => {
    expect(
      pickPhotoYear({
        exifDate: null,
        fileLastModified: new Date("2024-11-20"),
        currentEditionYear: 2026,
      })
    ).toBe(2024);
  });

  it("falls back to the current edition year when both are missing", () => {
    expect(
      pickPhotoYear({ exifDate: null, fileLastModified: null, currentEditionYear: 2026 })
    ).toBe(2026);
  });

  it("ignores an implausible EXIF date (camera clock reset) and falls through", () => {
    // A classic failure mode: camera battery died, clock reset to 1970 or a
    // far-future date. Trusting that would silently mis-file the photo.
    expect(
      pickPhotoYear({
        exifDate: new Date("1970-01-01"),
        fileLastModified: new Date("2026-03-10"),
        currentEditionYear: 2026,
      })
    ).toBe(2026);

    expect(
      pickPhotoYear({
        exifDate: null,
        fileLastModified: new Date("1970-01-01"),
        currentEditionYear: 2026,
      })
    ).toBe(2026);
  });
});
