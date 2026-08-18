import { getTranslations, getLocale } from "next-intl/server";
import PositionedImage from "@/components/PositionedImage";
import { getImageMap, type LocalizedImage } from "@/content/content";
import type { Locale } from "@/i18n/routing";
import styles from "./Eindruecke.module.css";

const IMAGE_KEYS = [
  "home.gallery.image1",
  "home.gallery.image2",
  "home.gallery.image3",
  "home.gallery.image4",
  "home.gallery.image5",
  "home.gallery.image6",
] as const;

/** Skips entirely until at least one image is set in Admin → Inhalte → Startseite
    → Eindrücke — same pattern as the Über-uns banner (docs/PLATZHALTER.md B10). */
export default async function Eindruecke() {
  const t = await getTranslations("home.gallery");
  const locale = (await getLocale()) as Locale;
  const images = await getImageMap(locale);

  const photos = IMAGE_KEYS.map((key) => images[key]).filter(
    (img): img is LocalizedImage => Boolean(img?.src)
  );
  if (photos.length === 0) return null;

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: "var(--space-15)" }}>
          {t("title")}
        </h2>
      </div>
      <div className={styles.scrollRow}>
        {photos.map((photo, i) => (
          <div key={i} className={styles.item}>
            <PositionedImage
              src={photo.src ?? ""}
              srcSet={photo.srcSet}
              sizes="(max-width: 900px) 220px, 280px"
              alt={photo.alt}
              focalX={photo.focalX}
              focalY={photo.focalY}
              zoom={photo.zoom}
              loading={i === 0 ? undefined : "lazy"}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
