import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import styles from "./Anmeldung.module.css";

export default function AnmeldungPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("anmeldung");

  return (
    <>
      <Nav variant="page" />
      <main>
        <section className="page-header section-dark">
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div className="hero-tag">{t("tag")}</div>
            <h1 className="page-header-title">{t("title")}</h1>
            <p className="hero-sub">{t("subtitle")}</p>
          </div>
        </section>

        <section className="section section-cream">
          <div className="container container-narrow" style={{ textAlign: "center" }}>
            <div className={styles.icon}>📅</div>
            <div className="section-label">{t("label")}</div>
            <h2 className="section-title" style={{ marginBottom: "var(--space-15)" }}>
              {t("heading")}
            </h2>
            <p className={styles.text}>{t("text")}</p>
            <Link href="/" className={styles.backButton}>
              {t("back")}
            </Link>
          </div>
        </section>
      </main>
      <Footer info="venue" />
    </>
  );
}
