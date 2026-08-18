import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/home/Hero";
import Eckdaten from "@/components/home/Eckdaten";
import WasWirAnbieten from "@/components/home/WasWirAnbieten";
import Eindruecke from "@/components/home/Eindruecke";
import { pageMetadata, BRAND } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import { getSettings, type SiteSettings } from "@/content/content";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });
  const title = t("title");
  const meta = pageMetadata({
    locale: locale as Locale,
    pathname: "/",
    title,
    description: t("description"),
  });
  // "/" is the one route where the root layout's title.template didn't
  // apply in testing — `absolute` sidesteps that by spelling out the full
  // title ourselves instead of relying on template inheritance.
  return { ...meta, title: { absolute: `${title} · ${BRAND}` } };
}

/**
 * Organization is always emitted (static facts, safe with no DB). The Event
 * block only appears once there's an actual date and venue to report —
 * otherwise we'd be asserting a training happens somewhere/sometime, which
 * isn't true yet (matches the "Eckdaten" section's own empty-state rule).
 */
function buildJsonLd(settings: SiteSettings | null) {
  const url = siteUrl();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Improve your skills",
    url,
    email: "info@improveyourskills.ch",
    founder: [
      { "@type": "Person", name: "Vanessa Schmuki" },
      { "@type": "Person", name: "Pascal Schmuki" },
      { "@type": "Person", name: "Claudio Schmid" },
    ],
  };

  if (!settings?.course_date || !settings.venue_name) return [organization];

  const event: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Unihockey Skill Training ${settings.current_edition_year}`,
    startDate: settings.course_date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: settings.venue_name,
      address: settings.venue_address ?? settings.venue_name,
    },
    organizer: { "@type": "Organization", name: "Improve your skills", url },
  };
  if (settings.price_chf != null) {
    event.offers = {
      "@type": "Offer",
      price: settings.price_chf,
      priceCurrency: "CHF",
      availability: settings.registration_open
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      url: `${url}/anmeldung`,
    };
  }

  return [organization, event];
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getSettings();

  return (
    <>
      {buildJsonLd(settings).map((entry, i) => (
        // eslint-disable-next-line react/no-danger
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
      <Nav variant="hero" />
      <main>
        <Hero />
        <Eckdaten />
        <WasWirAnbieten />
        <Eindruecke />
      </main>
      <Footer />
    </>
  );
}
