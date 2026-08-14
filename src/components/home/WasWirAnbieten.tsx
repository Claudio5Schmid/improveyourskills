import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/FadeIn";
import PositionedImage from "@/components/PositionedImage";
import { getImageMap } from "@/content/content";
import type { Locale } from "@/i18n/routing";
import styles from "./WasWirAnbieten.module.css";

export default async function WasWirAnbieten() {
  const t = await getTranslations("home.wwm");
  const locale = (await getLocale()) as Locale;
  const images = await getImageMap(locale);
  const bold = { b: (chunks: React.ReactNode) => <strong>{chunks}</strong> };

  const image = images["home.wwm.image"];
  const imageSrc = image?.src ?? "/Bilder/Bild_Waswirmachen.JPG";
  const imageAlt = image?.alt || t("imageAlt");

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.grid}>
          <FadeIn className={styles.text}>
            <div className="section-label">{t("label")}</div>
            <h2 className="section-title" style={{ marginBottom: "var(--space-15)" }}>
              {t("title")}
            </h2>
            <p className="lead">{t.rich("p1", bold)}</p>
            <div className={styles.badges}>
              <span className="badge">{t("badge1")}</span>
              <span className="badge">{t("badge2")}</span>
            </div>
            <Link
              href="/anmeldung"
              className="btn-primary"
              style={{
                display: "inline-block",
                marginTop: "var(--space-17)",
                background: "var(--color-green-dark)",
                color: "var(--color-cream)",
              }}
            >
              {t("cta")}
            </Link>
          </FadeIn>

          <FadeIn>
            <div className={styles.imgWrap}>
              <PositionedImage
                src={imageSrc}
                alt={imageAlt}
                focalX={image?.focalX}
                focalY={image?.focalY}
                zoom={image?.zoom}
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
