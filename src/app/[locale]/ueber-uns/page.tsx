import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { Link } from "@/i18n/navigation";
import AboutCarousel from "./AboutCarousel";
import styles from "./Ueber.module.css";

const TEAM = [
  {
    photo: "/Bilder/5_claudio_schmid.png",
    name: "claudioName",
    role: "claudioRole",
    bio: "claudioBio",
  },
  {
    photo: "/Bilder/17_pascal_schmuki.jpg.avif",
    name: "pascalName",
    role: "pascalRole",
    bio: "pascalBio",
  },
  {
    photo: "/Bilder/20_vanessa_schmuki.jpg",
    name: "vanessaName",
    role: "vanessaRole",
    bio: "vanessaBio",
  },
] as const;

const FEATURES = [
  { icon: "🎯", title: "feature1Title", text: "feature1Text" },
  { icon: "👥", title: "feature2Title", text: "feature2Text" },
  { icon: "🏆", title: "feature3Title", text: "feature3Text" },
] as const;

export default function UeberPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const h = useTranslations("ueber.header");
  const a = useTranslations("ueber.ansatz");
  const tm = useTranslations("ueber.team");

  return (
    <>
      <Nav variant="page" />
      <main>
        {/* Header (background image ueber-header.jpg is a placeholder — B5) */}
        <section className="page-header section-dark">
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div className="hero-tag">{h("tag")}</div>
            <h1 className="page-header-title">{h("title")}</h1>
            <p className="hero-sub">{h("subtitle")}</p>
          </div>
        </section>

        {/* Etwas zurückgeben */}
        <section className="section section-cream">
          <div className="container">
            <div className={`${styles.grid} ${styles.gridReverse}`}>
              <FadeIn>
                <AboutCarousel />
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
                  {FEATURES.map((f) => (
                    <div key={f.title} className={styles.featureItem}>
                      <div className={styles.featureIcon}>{f.icon}</div>
                      <div>
                        <strong>{a(f.title)}</strong>
                        <span>{a(f.text)}</span>
                      </div>
                    </div>
                  ))}
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
              {TEAM.map((member) => (
                <FadeIn key={member.name} className={styles.teamCard}>
                  <div className={styles.photo}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={member.photo} alt={tm(member.name)} />
                  </div>
                  <div className={styles.name}>{tm(member.name)}</div>
                  <div className={styles.role}>{tm(member.role)}</div>
                  <div className={styles.bio}>{tm(member.bio)}</div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer info="venueDate" />
    </>
  );
}
