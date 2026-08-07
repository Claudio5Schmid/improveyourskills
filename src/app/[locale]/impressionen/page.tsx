import type { Metadata } from "next";
import { getTranslations, getLocale, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getImageMap } from "@/content/content";
import { getGalleryPhotos, galleryYears } from "@/lib/gallery/data";
import type { Locale } from "@/i18n/routing";
import Gallery from "./Gallery";

const FALLBACK_HEADER = "/Bilder/Bilderimpressionen-hintergrund.jpg.JPG";
const ALL = "alle";

/**
 * The page itself may be indexed, but Google Images must never surface the
 * photos in it (brief §Phase 4 — consent covers "an impression of the
 * training", not a searchable public photo archive). `noimageindex` is the
 * page-level half of that; the other half is the X-Robots-Tag header every
 * `/api/foto/…` response sends on the image bytes themselves.
 */
export const metadata: Metadata = {
  robots: { index: true, follow: true, noimageindex: true },
};

export default async function ImpressionenPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ jahr?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("impressionen");
  const images = await getImageMap((await getLocale()) as Locale);
  const headerImage = images["impressionen.headerImage"]?.src ?? FALLBACK_HEADER;

  const photos = await getGalleryPhotos();
  const years = galleryYears(photos);

  // Default = most recent year with photos (brief). ?jahr= only wins if it
  // actually names "alle" or a year that has something to show.
  const requestedYear = (await searchParams).jahr;
  const initialYear =
    requestedYear === ALL || (requestedYear != null && years.includes(Number(requestedYear)))
      ? requestedYear
      : (years[0]?.toString() ?? ALL);

  return (
    <>
      <Nav variant="page" />
      <main>
        <section className="page-header section-dark page-header-short">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headerImage}
            alt=""
            className="page-header-bg"
            style={{ objectPosition: "center top" }}
          />
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div className="hero-tag">{t("tag")}</div>
            <h1 className="page-header-title">{t("title")}</h1>
            <p className="hero-sub">{t("subtitle")}</p>
          </div>
        </section>

        <section className="section section-cream">
          <div className="container">
            <Gallery photos={photos} years={years} initialYear={initialYear} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
