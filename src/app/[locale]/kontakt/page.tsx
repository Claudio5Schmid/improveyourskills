import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import KontaktMap from "./KontaktMap";
import styles from "./Kontakt.module.css";

export default function KontaktPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("kontakt");

  return (
    <>
      <Nav variant="page" />
      <main>
        <section className="page-header section-dark page-header-short">
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div className="hero-tag">{t("tag")}</div>
            <h1 className="page-header-title">{t("title")}</h1>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className={styles.grid}>
              <FadeIn className={styles.info}>
                <h2>{t("infoTitle")}</h2>
                <p>{t("infoText")}</p>
                <a href="mailto:pascal.schmuki@bluewin.ch" className={styles.emailBtn}>
                  {t("emailButton")}
                </a>
              </FadeIn>

              {/* Direct grid child so align-items:stretch matches the info height. */}
              <KontaktMap />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
