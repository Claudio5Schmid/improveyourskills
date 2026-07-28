import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";

/**
 * Impressum — faithful Phase-1 port. The old page referenced .impressum-card /
 * .impressum-block classes that were never styled, so it renders with browser
 * defaults (kept here for parity). It is also orphaned in the current site
 * (linked from nowhere) and contains known errors (see docs/AUDIT.md §5.6).
 * Phase 7 replaces it with a proper, reviewed Impressum + Datenschutz.
 */
export default function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("impressum");
  const bold = { b: (chunks: React.ReactNode) => <strong>{chunks}</strong> };
  const mail = <a href={`mailto:${t("contactEmail")}`}>{t("contactEmailLabel")}</a>;

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

        <section className="section">
          <div className="container container-narrow">
            <div className="impressum-card">
              <div className="impressum-block">
                <h2>{t("personsHeading")}</h2>
                <p style={{ whiteSpace: "pre-line" }}>{t("personsBody")}</p>
              </div>

              <div className="impressum-block">
                <h2>{t("contactHeading")}</h2>
                <p>E-Mail: {mail}</p>
              </div>

              <div className="impressum-block">
                <h2>{t("eventHeading")}</h2>
                <p style={{ whiteSpace: "pre-line" }}>{t("eventBody")}</p>
              </div>

              <div className="impressum-block">
                <h2>{t("privacyHeading")}</h2>
                <p>{t("privacyP1")}</p>
                <p>{t.rich("privacyP2", bold)}</p>
                <p>{t.rich("privacyP3", bold)}</p>
                <p>
                  {t("privacyP4")} {mail}
                </p>
              </div>

              <div className="impressum-block">
                <h2>{t("liabilityHeading")}</h2>
                <p>{t("liabilityBody")}</p>
              </div>

              <div className="impressum-block">
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
