"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./Ueber.module.css";

/**
 * Über-uns image carousel. Behaviour ported from the old inline script:
 * 4 slides, prev/next arrows, clickable dots, 6s autoplay that resets on manual
 * interaction, looping. Autoplay is skipped under prefers-reduced-motion.
 *
 * Slides are hardcoded for the Phase-1 port; Phase 2 sources them from the
 * carousel_images table.
 */
const SLIDES = [
  "/Bilder/54984091234_0a498c59d6_o.jpg",
  "/Bilder/54560170314_01b6b9c809_o.jpeg",
  "/Bilder/54983832553_b1dfd1ce04_o.jpg",
  "/Bilder/1ECD3D4C-B83D-4BF2-B8C0-EE69FF124190.jpg",
];
const AUTOPLAY_MS = 6000;

export default function AboutCarousel() {
  const t = useTranslations("ueber.carousel");
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = useRef(false);

  const startTimer = useCallback(() => {
    if (reduced.current) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    startTimer();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [startTimer]);

  const goTo = (index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
    startTimer();
  };

  return (
    <div className={styles.sliderWrap}>
      <div className={styles.slider}>
        {SLIDES.map((src, i) => (
          <div key={src} className={`${styles.slide}${i === current ? ` ${styles.active}` : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.sliderBtn} ${styles.sliderBtnPrev}`}
        onClick={() => goTo(current - 1)}
        aria-label={t("prev")}
      >
        ←
      </button>
      <button
        type="button"
        className={`${styles.sliderBtn} ${styles.sliderBtnNext}`}
        onClick={() => goTo(current + 1)}
        aria-label={t("next")}
      >
        →
      </button>

      <div className={styles.dots}>
        {SLIDES.map((src, i) => (
          <button
            key={src}
            type="button"
            className={`${styles.dot}${i === current ? ` ${styles.active}` : ""}`}
            onClick={() => goTo(i)}
            aria-label={t("slide", { n: i + 1 })}
            aria-current={i === current}
          />
        ))}
      </div>
    </div>
  );
}
