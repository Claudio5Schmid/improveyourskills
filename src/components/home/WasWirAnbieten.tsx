import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/FadeIn";
import styles from "./WasWirAnbieten.module.css";

export default function WasWirAnbieten() {
  const t = useTranslations("home.wwm");
  const bold = { b: (chunks: React.ReactNode) => <strong>{chunks}</strong> };

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
            <p>{t("p2")}</p>
            <p>{t.rich("p3", bold)}</p>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Bilder/Bild_Waswirmachen.JPG" alt={t("imageAlt")} />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
