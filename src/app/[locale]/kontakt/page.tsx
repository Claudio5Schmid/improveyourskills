import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import PositionedImage from "@/components/PositionedImage";
import { getImageMap } from "@/content/content";
import type { Locale } from "@/i18n/routing";
import KontaktMap from "./KontaktMap";
import KontaktForm from "./KontaktForm";
import styles from "./Kontakt.module.css";

export default async function KontaktPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("kontakt");
  const images = await getImageMap((await getLocale()) as Locale);
  const headerImage = images["kontakt.headerImage"];

  return (
    <>
      <Nav variant="page" />
      <main>
        <section className="page-header section-dark">
          {headerImage?.src && (
            <PositionedImage
              src={headerImage.src}
              alt=""
              focalX={headerImage.focalX}
              focalY={headerImage.focalY}
              zoom={headerImage.zoom}
              className="page-header-bg"
            />
          )}
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div className="hero-tag">{t("tag")}</div>
            <h1 className="page-header-title">{t("title")}</h1>
          </div>
        </section>

        <section className={`section ${styles.compactSection}`}>
          <div className="container">
            <div className={styles.stack}>
              <FadeIn className={styles.info}>
                <h2>{t("infoTitle")}</h2>
                <p>{t("infoText")}</p>
                <KontaktForm />
              </FadeIn>

              {/* Full width, fixed height — no longer a grid sibling of .info,
                  so it can never be stretched by the form's own height. */}
              <KontaktMap />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
