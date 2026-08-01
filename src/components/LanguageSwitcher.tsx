"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import styles from "./LanguageSwitcher.module.css";

function GlobeIcon() {
  return (
    <svg
      className={styles.globe}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" />
    </svg>
  );
}

/**
 * Language switch: a globe button that opens a dropdown to pick DE / EN / FR.
 * Keeps the visitor on the current page and only swaps the locale prefix.
 * Accessible: aria-haspopup/-expanded, closes on Escape and outside click.
 */
export default function LanguageSwitcher() {
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.switcher} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        <span className={styles.current}>{activeLocale.toUpperCase()}</span>
      </button>

      {open && (
        <ul className={styles.menu} role="menu">
          {routing.locales.map((loc: Locale) => (
            <li key={loc} role="none">
              <Link
                href={pathname}
                locale={loc}
                hrefLang={loc}
                role="menuitem"
                aria-current={loc === activeLocale ? "true" : undefined}
                className={loc === activeLocale ? styles.itemActive : styles.item}
                onClick={() => setOpen(false)}
              >
                {t(loc)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
