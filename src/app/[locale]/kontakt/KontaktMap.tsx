"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./Kontakt.module.css";

/**
 * Google Maps embed, click-to-load for privacy (agreed decision #4). No request
 * goes to Google until the visitor presses the button — this keeps the
 * "no consent banner needed" reasoning intact (see docs/PLAN.md §Phase 7).
 */
const MAP_SRC =
  "https://maps.google.com/maps?q=Sportanlage+Buchholz+Uster+8610+Schweiz&output=embed&hl=de&z=15";

export default function KontaktMap() {
  const [loaded, setLoaded] = useState(false);
  const t = useTranslations("kontakt");

  return (
    <div className={styles.mapWrap}>
      {loaded ? (
        <iframe
          src={MAP_SRC}
          title={t("mapTitle")}
          className={styles.mapFrame}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className={styles.mapPlaceholder}
          onClick={() => setLoaded(true)}
          aria-label={t("mapLoad")}
        >
          <span className={styles.mapLoadBtn}>{t("mapLoad")}</span>
          <span className={styles.mapNote}>{t("mapNote")}</span>
        </button>
      )}
    </div>
  );
}
