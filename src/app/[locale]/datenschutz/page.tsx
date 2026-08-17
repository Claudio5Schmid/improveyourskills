import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "@/components/legal/Legal.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "datenschutz" });
  return pageMetadata({
    locale: locale as Locale,
    pathname: "/datenschutz",
    title: t("title").replace(/\.$/, ""),
    description: t("metaDescription"),
  });
}

/**
 * Datenschutzerklärung — Phase 7, full version. Replaces the Phase-5 stopgap
 * (which only covered the contact form). Every claim here is checked against
 * what the code actually does (cookies, processors, retention) rather than
 * generic boilerplate — see the Phase-7 checkpoint for the source facts.
 * Still explicitly marked as a draft Claudio must read before launch (brief:
 * "not legal advice"), but no longer noindex — this is the real page now,
 * linked from the footer.
 */
export default function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("datenschutz");

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
              <div className={styles.notice}>
                <p>{t("draftNotice")}</p>
              </div>

              <div className={styles.block}>
                <p>{t("intro")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("responsibleHeading")}</h2>
                <p>{t("responsibleBody")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("dataHeading")}</h2>
                <p>{t("dataContactBody")}</p>
                <p>{t("dataPhotosBody")}</p>
                <p>{t("dataLogsBody")}</p>
                <p>{t("dataAdminBody")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("cookiesHeading")}</h2>
                <p>{t("cookiesBody")}</p>
                <ul className={styles.cookieList}>
                  <li>{t("cookieLocale")}</li>
                  <li>{t("cookieAdmin")}</li>
                  <li>{t("cookieTurnstile")}</li>
                </ul>
                <p>{t("cookiesNoBanner")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("processorsHeading")}</h2>
                <p>{t("processorsBody")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("retentionHeading")}</h2>
                <p>{t("retentionBody")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("rightsHeading")}</h2>
                <p>{t("rightsBody")}</p>
              </div>

              <div className={styles.block}>
                <h2>{t("contactHeading")}</h2>
                <p>{t("contactBody")}</p>
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
