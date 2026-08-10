import { getTranslations, getLocale, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Link } from "@/i18n/navigation";
import {
  getTeam,
  getCarousel,
  getImageMap,
  getStats,
  getTestimonials,
  type LocalizedImage,
} from "@/content/content";
import type { Locale } from "@/i18n/routing";
import AboutCarousel from "./AboutCarousel";
import StatsBand from "./StatsBand";
import styles from "./Ueber.module.css";

// Icons are structural; the titles/texts (and optional replacement images)
// come from the DB (ueber.ansatz.*).
const FEATURES = [
  { icon: "🎯", title: "feature1Title", text: "feature1Text", imageKey: "ueber.ansatz.feature1Image" },
  { icon: "👥", title: "feature2Title", text: "feature2Text", imageKey: "ueber.ansatz.feature2Image" },
  { icon: "🏆", title: "feature3Title", text: "feature3Text", imageKey: "ueber.ansatz.feature3Image" },
] as const;

// Fallbacks used only if the DB returns nothing (keeps the page populated).
const FALLBACK_TEAM = [
  {
    name: "Claudio Schmid",
    role: "Organisator & Trainer",
    bio: "Nationalspieler · SVWE (Rekordmeister Schweizer Unihockey)",
    photo: "/Bilder/5_claudio_schmid.png",
  },
  {
    name: "Pascal Schmuki",
    role: "Organisator & Trainer",
    bio: "Nationalspieler · Storvreta IBK (Schweden, bester Verein der Welt)",
    photo: "/Bilder/17_pascal_schmuki.jpg.avif",
  },
  {
    name: "Vanessa Schmuki",
    role: "Organisatorin & Trainerin",
    bio: "Nationalspielerin · Weltmeisterin · 2-fache Schweizer Meisterin · Kloten-Dietlikon Jets",
    photo: "/Bilder/20_vanessa_schmuki.jpg",
  },
];
const FALLBACK_CAROUSEL: LocalizedImage[] = [
  { src: "/Bilder/54984091234_0a498c59d6_o.jpg", alt: "" },
  { src: "/Bilder/54560170314_01b6b9c809_o.jpeg", alt: "" },
  { src: "/Bilder/54983832553_b1dfd1ce04_o.jpg", alt: "" },
  { src: "/Bilder/1ECD3D4C-B83D-4BF2-B8C0-EE69FF124190.jpg", alt: "" },
];

export default async function UeberPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;

  const h = await getTranslations("ueber.header");
  const a = await getTranslations("ueber.ansatz");
  const tm = await getTranslations("ueber.team");
  const tz = await getTranslations("ueber.zitate");

  const [team, carousel, images, stats, testimonials] = await Promise.all([
    getTeam(loc),
    getCarousel(loc),
    getImageMap(loc),
    getStats(loc),
    getTestimonials(loc),
  ]);

  const teamList = team.length > 0 ? team : FALLBACK_TEAM;
  const slides = carousel.length > 0 ? carousel : FALLBACK_CAROUSEL;
  const carouselSlides = slides.map((s) => ({ src: s.src as string, alt: s.alt }));
  const headerImage = images["ueber.header.image"]?.src ?? null;
  const bannerImage = images["ueber.banner"]?.src ?? null;

  return (
    <>
      <Nav variant="page" />
      <main>
        <section className="page-header section-dark">
          {headerImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={headerImage} alt="" className="page-header-bg" />
          )}
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div className="hero-tag">{h("tag")}</div>
            <h1 className="page-header-title">{h("title")}</h1>
            <p className="hero-sub">{h("subtitle")}</p>
          </div>
        </section>

        <StatsBand stats={stats} />

        {/* Etwas zurückgeben */}
        <section className="section section-cream">
          <div className="container">
            <div className={`${styles.grid} ${styles.gridReverse}`}>
              <FadeIn>
                <AboutCarousel slides={carouselSlides} />
              </FadeIn>

              <FadeIn className={styles.text}>
                <div className="section-label">{a("label")}</div>
                <h2
                  className="section-title"
                  style={{ fontSize: "var(--font-size-5xl)", marginBottom: "var(--space-15)" }}
                >
                  {a("title")}
                </h2>
                <p className={styles.lead}>{a("lead")}</p>
                <p>{a("p")}</p>
                <div className={styles.features}>
                  {FEATURES.map((f) => {
                    const featureImage = images[f.imageKey]?.src;
                    return (
                      <div key={f.title} className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                          {featureImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={featureImage} alt="" className={styles.featureImg} />
                          ) : (
                            f.icon
                          )}
                        </div>
                        <div>
                          <strong>{a(f.title)}</strong>
                          <span>{a(f.text)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href="/anmeldung"
                  className="btn-primary"
                  style={{
                    display: "inline-block",
                    marginTop: "var(--space-17)",
                    background: "var(--color-green-dark)",
                    color: "var(--color-cream)",
                  }}
                >
                  {a("cta")}
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section">
          <div className="container">
            <div className="section-label">{tm("label")}</div>
            <h2 className="section-title">{tm("title")}</h2>
            <div className={styles.teamGrid}>
              {teamList.map((member) => (
                <FadeIn key={member.name} className={styles.teamCard}>
                  <div className={styles.photo}>
                    {member.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photo} alt={member.name} />
                    )}
                  </div>
                  <div className={styles.name}>{member.name}</div>
                  <div className={styles.role}>{member.role}</div>
                  <div className={styles.bio}>{member.bio}</div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Banner — optional, skips entirely if empty (docs/PLATZHALTER.md B10) */}
        {bannerImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerImage} alt="" className={styles.banner} />
        )}

        {/* Zitate — skips entirely if none are visible yet (docs/PLATZHALTER.md T8) */}
        {testimonials.length > 0 && (
          <section className="section section-cream">
            <div className="container">
              <div className="section-label">{tz("label")}</div>
              <h2 className="section-title">{tz("title")}</h2>
              <div className={styles.testimonialsGrid}>
                {testimonials.map((t, i) => (
                  <FadeIn key={i} className={styles.testimonialCard}>
                    <p className={styles.testimonialQuote}>{t.quote}</p>
                    {t.authorName && (
                      <div className={styles.testimonialAuthor}>{t.authorName}</div>
                    )}
                    {t.authorRole && (
                      <div className={styles.testimonialRole}>{t.authorRole}</div>
                    )}
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer info="venueDate" />
    </>
  );
}
