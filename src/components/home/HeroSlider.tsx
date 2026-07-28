"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

/**
 * Hero background slider. Three images cross-fade every 5s, matching the old
 * inline script. The images are decorative (alt=""), so they add no noise for
 * screen readers. Auto-advance is skipped under prefers-reduced-motion.
 *
 * These are the original full-size images for a faithful Phase-1 port; the
 * image pipeline (WebP variants, lazy loading) lands in Phase 7.
 */
const SLIDES = [
  "/Bilder/55193886120_4a1069cdcf_o.jpeg",
  "/Bilder/54878038952_978afe6028_o.jpg",
  "/54923280127_69f6204584_k.jpg",
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.slider}>
      {SLIDES.map((src, i) => (
        <div key={src} className={`${styles.slide}${i === active ? ` ${styles.active}` : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" />
        </div>
      ))}
    </div>
  );
}
