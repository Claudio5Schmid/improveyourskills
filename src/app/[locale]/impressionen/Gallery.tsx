"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Lightbox from "./Lightbox";
import styles from "./Impressionen.module.css";
import type { GalleryPhoto } from "@/lib/gallery/data";

const ALL = "alle";

/**
 * Year-filtered gallery grid. Filtering is entirely client-side (brief
 * §Phase 4): switching a chip only changes local state and the URL's `?jahr=`
 * — via the native History API, not `next/navigation`, so it never triggers
 * a server round-trip. That also means only the SELECTED year's `<img>`
 * elements ever exist in the DOM, so switching tabs doesn't quietly fetch
 * every year's thumbnails at once.
 */
export default function Gallery({
  photos,
  years,
  initialYear,
}: {
  photos: GalleryPhoto[];
  years: number[];
  initialYear: string;
}) {
  const t = useTranslations("impressionen");
  const [selected, setSelected] = useState(initialYear);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (selected === ALL ? photos : photos.filter((p) => String(p.year) === selected)),
    [photos, selected]
  );

  const selectYear = (year: string) => {
    setSelected(year);
    setLightboxIndex(null);
    const url = new URL(window.location.href);
    if (year === ALL) url.searchParams.delete("jahr");
    else url.searchParams.set("jahr", year);
    window.history.replaceState(null, "", url);
  };

  if (photos.length === 0) {
    return <p className={styles.empty}>{t("empty")}</p>;
  }

  return (
    <>
      <div className={styles.filterBar} role="tablist" aria-label={t("tag")}>
        <button
          type="button"
          role="tab"
          aria-selected={selected === ALL}
          className={`${styles.chip} ${selected === ALL ? styles.chipActive : ""}`}
          onClick={() => selectYear(ALL)}
        >
          {t("filterAll")}
        </button>
        {years.map((year) => (
          <button
            key={year}
            type="button"
            role="tab"
            aria-selected={selected === String(year)}
            className={`${styles.chip} ${selected === String(year) ? styles.chipActive : ""}`}
            onClick={() => selectYear(String(year))}
          >
            {year}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visible.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            className={styles.tile}
            style={{
              aspectRatio:
                photo.thumb.width && photo.thumb.height
                  ? `${photo.thumb.width} / ${photo.thumb.height}`
                  : "1 / 1",
              backgroundImage: photo.blurDataUrl ? `url(${photo.blurDataUrl})` : undefined,
            }}
            aria-label={t("openPhoto", { n: i + 1 })}
            onClick={() => setLightboxIndex(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/foto/${photo.id}/thumb`}
              alt=""
              width={photo.thumb.width || undefined}
              height={photo.thumb.height || undefined}
              loading="lazy"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={visible}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
