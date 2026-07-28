"use client";

import { Fragment } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import styles from "./LanguageSwitcher.module.css";

/**
 * Discreet DE / EN / FR switch. Keeps the visitor on the current page and only
 * swaps the locale prefix. EN/FR are placeholder copies for now (see
 * docs/PLAN.md); the switch is wired so real translations just drop in.
 */
export default function LanguageSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("language");

  return (
    <div className={styles.switcher} role="group" aria-label={t("label")}>
      {routing.locales.map((loc: Locale, i) => (
        <Fragment key={loc}>
          {i > 0 && (
            <span className={styles.sep} aria-hidden="true">
              ·
            </span>
          )}
          {loc === activeLocale ? (
            <span className={styles.active} aria-current="true">
              {loc.toUpperCase()}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={loc}
              hrefLang={loc}
              aria-label={t("switchTo", { lang: t(loc) })}
              className={styles.item}
            >
              {loc.toUpperCase()}
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
