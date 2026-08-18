"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "/ueber-uns", key: "ueber" },
  { href: "/impressionen", key: "impressionen" },
  { href: "/kontakt", key: "kontakt" },
  { href: "/anmeldung", key: "anmelden" },
] as const;

/**
 * Site navigation. Replaces the markup + inline script that was copied into all
 * six pages. Behaviour ported from the old scripts, plus the accessibility the
 * old menu lacked (aria-expanded, focus trap, Escape, body scroll lock).
 *
 * `variant`:
 *  - "hero" (home): transparent over the hero, turns solid past 60px of scroll.
 *  - "page" (subpages): solid from the start; matches the old `class="scrolled"`.
 * As in the old scripts, the solid state only changes on actual scroll events.
 */
export default function Nav({ variant = "page" }: { variant?: "hero" | "page" }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(variant === "page");
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Scroll state — matches the old handler (only reacts to scroll events).
  useEffect(() => {
    const threshold = variant === "hero" ? 60 : 0;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const close = useCallback(() => setOpen(false), []);

  // While the mobile menu is open: lock body scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      menuRef.current
        ? Array.from(menuRef.current.querySelectorAll<HTMLElement>("a[href], button"))
        : [];

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // If the viewport grows past the mobile breakpoint, drop the open state.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={close}>
          <span className={styles.logoText}>{tc("brand")}</span>
        </Link>

        <button
          ref={burgerRef}
          type="button"
          className={`${styles.burger} ${open ? styles.open : ""}`}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul id="nav-menu" ref={menuRef} className={`${styles.links} ${open ? styles.open : ""}`}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={isActive(link.href) ? styles.active : undefined}
                aria-current={isActive(link.href) ? "page" : undefined}
                onClick={close}
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
          <li>
            <LanguageSwitcher />
          </li>
        </ul>
      </div>
    </nav>
  );
}
