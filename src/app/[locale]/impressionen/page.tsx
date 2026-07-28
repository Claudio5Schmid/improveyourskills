import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * Impressionen — Phase-1 faithful port of the current page: a tall header with
 * a background image and a button linking to the external OneDrive folder.
 * Phase 4 replaces this with the on-site, per-year gallery (the OneDrive link
 * stays as a separate channel for parents — see docs/PLAN.md §Phase 4).
 */
const ONEDRIVE_URL =
  "https://1drv.ms/f/c/5b3d63cbc09cd128/IgBai4t0ht06QqeepkLl4vNsAQMaz8AItNJmlnnRuWKX_nI?e=fZfvtA";

export default function ImpressionenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("impressionen");

  return (
    <>
      <Nav variant="page" />
      <main>
        <section className="page-header section-dark" style={{ minHeight: "80vh" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Bilder/Bilderimpressionen-hintergrund.jpg.JPG"
            alt=""
            className="page-header-bg"
            style={{ objectPosition: "center top" }}
          />
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div className="hero-tag">{t("tag")}</div>
            <h1 className="page-header-title">{t("title")}</h1>
            <p className="hero-sub">{t("subtitle")}</p>
            <div style={{ marginTop: "var(--space-19)" }}>
              <a
                href={ONEDRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {t("button")}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
