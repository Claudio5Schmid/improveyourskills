import { getTranslations, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/content/content";
import styles from "./Anmeldung.module.css";

export default async function AnmeldungPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("anmeldung");
  const settings = await getSettings();
  const isOpen = settings?.registration_open ?? false;

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
            {isOpen ? (
              /* No self-service registration form is planned (confirmed with Claudio
                 during Phase 5 — Phase 5 built only the Kontakt form, see
                 PROJECT_BRIEF.md §Phase 5). The "open" state tells visitors we're
                 open and points them at /kontakt; that's the whole flow. */
              <>
                <div className={styles.icon}>✍️</div>
                <div className="section-label">{t("openLabel")}</div>
                <h2 className="section-title" style={{ marginBottom: "var(--space-15)" }}>
                  {t("openHeading")}
                </h2>
                <p className={styles.text}>{t("openText")}</p>
                <Link href="/kontakt" className={styles.backButton}>
                  {t("openButton")}
                </Link>
              </>
            ) : (
              <>
                <div className={styles.icon}>📅</div>
                <div className="section-label">{t("label")}</div>
                <h2 className="section-title" style={{ marginBottom: "var(--space-15)" }}>
                  {t("heading")}
                </h2>
                <p className={styles.text}>{t("text")}</p>
                <Link href="/" className={styles.backButton}>
                  {t("back")}
                </Link>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer info="venue" />
    </>
  );
}
