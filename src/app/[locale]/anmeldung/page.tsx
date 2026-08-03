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
              /* The actual form is Phase 5. Until then, the "open" state just tells
                 visitors we are open and how to reach us; it is not the empty
                 Save-the-Date. */
              <>
                <div className={styles.icon}>✍️</div>
                <div className="section-label">Anmeldung</div>
                <h2 className="section-title" style={{ marginBottom: "var(--space-15)" }}>
                  Anmeldung geöffnet
                </h2>
                <p className={styles.text}>
                  Das Formular wird in wenigen Tagen hier aufgeschaltet. Bitte schau bald wieder
                  vorbei — oder schreib uns bis dahin per <Link href="/kontakt">Kontakt</Link>.
                </p>
                <Link href="/kontakt" className={styles.backButton}>
                  Zum Kontakt
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
