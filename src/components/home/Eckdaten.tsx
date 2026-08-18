import { getTranslations, getLocale } from "next-intl/server";
import { getHomeFacts } from "@/content/content";
import { FACT_ICONS, isFactIconKey } from "@/lib/facts-icons";
import type { Locale } from "@/i18n/routing";
import styles from "./Eckdaten.module.css";

/** Skips entirely until at least one fact is added and marked visible in
    Admin → Eckdaten — same pattern as the stats band on Über uns. */
export default async function Eckdaten() {
  const t = await getTranslations("home.facts");
  const locale = (await getLocale()) as Locale;
  const facts = await getHomeFacts(locale);
  if (facts.length === 0) return null;

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            {t("title")}
          </h2>
          <p className={styles.lead}>{t("lead")}</p>
        </div>

        <div className={styles.grid}>
          {facts.map((fact, i) => {
            const { Icon } = FACT_ICONS[isFactIconKey(fact.icon) ? fact.icon : "info"];
            return (
              <div key={i} className={styles.card}>
                <div className={styles.iconWrap}>
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <div className={styles.label}>{fact.label}</div>
                {fact.status === "set" ? (
                  <div className={styles.value}>{fact.value || "—"}</div>
                ) : (
                  <div className={styles.valueMuted}>
                    {fact.status === "open" ? t("statusOpen") : t("statusSoon")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
