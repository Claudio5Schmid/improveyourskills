import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import styles from "@/components/legal/Legal.module.css";

/**
 * Impressum — Phase 7, real content (Claudio supplied the responsible-party
 * text, 2026-08-17). No venue/date block anymore: the Footer below already
 * renders that dynamically from site_settings, so it can't drift out of sync
 * the way the old static text did (docs/AUDIT.md §5.6, T3/T4).
 */
export default function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("impressum");
  const mail = <a href={`mailto:${t("contactEmail")}`}>{t("contactEmail")}</a>;
  const datenschutzLink = {
    link: (chunks: React.ReactNode) => <Link href="/datenschutz">{chunks}</Link>,
  };

  return (
    <>
      <Nav variant="page" />
      <main>
        <section className="page-header section-dark page-header-short">
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <h1 className="page-header-title">{t("title")}</h1>
          </div>
        </section>

        <section className={`section ${styles.section}`}>
          <div className="container container-narrow">
            <div className={styles.card}>
              <div className={styles.block}>
                <h2>{t("responsibleHeading")}</h2>
                <p>{t("responsibleBody")}</p>
                <p>{t("projectNote")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("contactHeading")}</h2>
                <p>E-Mail: {mail}</p>
                <p>{t("contactMore")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("photoHeading")}</h2>
                <p>{t("photoBody")}</p>
                <p>{t.rich("photoMore", datenschutzLink)}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("liabilityHeading")}</h2>
                <p>{t("liabilityBody")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("copyrightHeading")}</h2>
                <p>{t("copyrightBody")}</p>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "var(--space-21)" }}>
              <Link
                href="/"
                className="btn-primary"
                style={{
                  display: "inline-block",
                  background: "var(--color-green-dark)",
                  color: "var(--color-cream)",
                }}
              >
                {t("back")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer info="venueDate" />
    </>
  );
}
