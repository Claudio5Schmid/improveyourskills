/**
 * The year-picking cascade for a freshly selected photo (brief §Phase 4):
 * EXIF `DateTimeOriginal` → file's last-modified date → the current edition
 * year. Kept pure and dependency-free (no exifr, no DOM) so it's trivially
 * testable — the async orchestration that actually reads EXIF lives in
 * `./exif.ts` (`resolvePhotoYear`), which calls this.
 */
export function pickPhotoYear(input: {
  exifDate: Date | null;
  fileLastModified: Date | null;
  currentEditionYear: number;
}): number {
  if (input.exifDate && isPlausibleYear(input.exifDate.getFullYear())) {
    return input.exifDate.getFullYear();
  }
  if (input.fileLastModified && isPlausibleYear(input.fileLastModified.getFullYear())) {
    return input.fileLastModified.getFullYear();
  }
  return input.currentEditionYear;
}

/** Guards against garbage EXIF dates (e.g. a camera clock reset to 1970 or 2099). */
function isPlausibleYear(year: number): boolean {
  return Number.isFinite(year) && year >= 2000 && year <= 2100;
}
