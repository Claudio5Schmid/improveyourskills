"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

/**
 * Hero background slider. The images cross-fade every 5s (matching the old
 * inline script). Images are decorative (alt=""); auto-advance is skipped under
 * prefers-reduced-motion and when there is only one image.
 */
export default function HeroSlider({ slides }: { slides: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className={styles.slider}>
      {slides.map((src, i) => (
        <div key={src} className={`${styles.slide}${i === active ? ` ${styles.active}` : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" />
        </div>
      ))}
    </div>
  );
}
