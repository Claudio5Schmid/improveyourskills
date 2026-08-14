"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import PositionedImage from "@/components/PositionedImage";
import styles from "./Ueber.module.css";

export interface CarouselSlide {
  src: string;
  alt: string;
  focalX?: number;
  focalY?: number;
  zoom?: number;
}

/**
 * Über-uns image carousel. Behaviour ported from the old inline script:
 * prev/next arrows, clickable dots, 6s autoplay that resets on manual
 * interaction, looping. Autoplay is skipped under prefers-reduced-motion and
 * with a single slide. Slides come from the carousel_images table (passed in).
 */
const AUTOPLAY_MS = 6000;

export default function AboutCarousel({ slides }: { slides: CarouselSlide[] }) {
  const t = useTranslations("ueber.carousel");
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = useRef(false);
  const count = slides.length;

  const startTimer = useCallback(() => {
    if (reduced.current || count <= 1) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, AUTOPLAY_MS);
  }, [count]);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    startTimer();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [startTimer]);

  const goTo = (index: number) => {
    if (count === 0) return;
    setCurrent((index + count) % count);
    startTimer();
  };

  return (
    <div className={styles.sliderWrap}>
      <div className={styles.slider}>
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`${styles.slide}${i === current ? ` ${styles.active}` : ""}`}
          >
            <PositionedImage
              src={slide.src}
              alt={slide.alt}
              focalX={slide.focalX}
              focalY={slide.focalY}
              zoom={slide.zoom}
            />
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
        {slides.map((slide, i) => (
          <button
            key={slide.src}
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
