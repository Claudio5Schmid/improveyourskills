import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";

/**
 * Draft privacy page — exists so the contact form's consent checkbox
 * (Phase 5) has something real to link to, not a dead link. Deliberately
 * minimal and factual (only describes what Phase 5 itself introduced: the
 * contact form's data flow). NOT linked from the footer or nav — Phase 7
 * replaces this with the full, reviewed Datenschutzerklärung (see
 * PROJECT_BRIEF.md §Phase 7) and links it from the footer then.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

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

        <section className="section">
          <div className="container container-narrow">
            <div className="impressum-card">
              <div
                className="impressum-block"
                style={{
                  padding: "var(--space-13)",
                  borderRadius: "var(--radius-input)",
                  background: "var(--color-danger-surface)",
                  border: "1px solid var(--color-danger-border)",
                  color: "var(--color-danger-text)",
                }}
              >
                <p>{t("draftNotice")}</p>
              </div>

              <div className="impressum-block">
                <p>{t("intro")}</p>
              </div>

              <div className="impressum-block">
                <h2>{t("formHeading")}</h2>
                <p>{t("formBody")}</p>
              </div>

              <div className="impressum-block">
                <h2>{t("accessHeading")}</h2>
                <p>{t("accessBody")}</p>
              </div>

              <div className="impressum-block">
                <h2>{t("processorsHeading")}</h2>
                <p>{t("processorsBody")}</p>
              </div>

              <div className="impressum-block">
                <h2>{t("retentionHeading")}</h2>
                <p>{t("retentionBody")}</p>
              </div>

              <div className="impressum-block">
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
