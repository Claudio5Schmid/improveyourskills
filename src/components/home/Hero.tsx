import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getImageMap } from "@/content/content";
import type { Locale } from "@/i18n/routing";
import HeroSlider from "./HeroSlider";
import styles from "./Hero.module.css";

// Used if the DB returns no hero images (keeps the hero populated when the DB
// is unreachable). Normal operation uses the images edited in the admin.
const FALLBACK_SLIDES = [
  "/Bilder/55193886120_4a1069cdcf_o.jpeg",
  "/Bilder/54878038952_978afe6028_o.jpg",
  "/54923280127_69f6204584_k.jpg",
];

export default async function Hero() {
  const t = await getTranslations("home.hero");
  const locale = (await getLocale()) as Locale;
  const images = await getImageMap(locale);

  const dbSlides = ["home.hero.image1", "home.hero.image2", "home.hero.image3"]
    .map((key) => images[key]?.src)
    .filter((src): src is string => Boolean(src));
  const slides = dbSlides.length > 0 ? dbSlides : FALLBACK_SLIDES;

  return (
    <section className={styles.hero}>
      <div className={styles.bg}>
        <HeroSlider slides={slides} />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className="hero-tag animate-up delay-1">{t("tag")}</div>
        <h1 className={`${styles.title} animate-up delay-2`}>
          Improve
          <br />
          <span className={styles.accent}>your</span>
          <br />
          skills.
        </h1>
        <p className="hero-sub animate-up delay-3">{t("subtitle")}</p>
        <div className={`${styles.actions} animate-up delay-4`}>
          <Link href="/anmeldung" className="btn-primary">
            {t("ctaPrimary")}
          </Link>
          <Link href="/ueber-uns" className="btn-ghost">
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>

      <div className={`${styles.scrollHint} animate-up delay-5`}>
        <span />
      </div>
    </section>
  );
}
