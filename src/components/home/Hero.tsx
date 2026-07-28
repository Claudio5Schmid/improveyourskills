import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HeroSlider from "./HeroSlider";
import styles from "./Hero.module.css";

export default function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className={styles.hero}>
      <div className={styles.bg}>
        <HeroSlider />
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
