"use client";

import { useEffect, useState } from "react";
import PositionedImage from "@/components/PositionedImage";
import type { LocalizedImage } from "@/content/content";
import styles from "./Hero.module.css";

/**
 * Hero background slider. The images cross-fade every 5s (matching the old
 * inline script). Images are decorative (alt=""); auto-advance is skipped under
 * prefers-reduced-motion and when there is only one image.
 */
export default function HeroSlider({ slides }: { slides: LocalizedImage[] }) {
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
      {slides.map((slide, i) => (
        <div key={slide.src} className={`${styles.slide}${i === active ? ` ${styles.active}` : ""}`}>
          <PositionedImage
            src={slide.src ?? ""}
            srcSet={slide.srcSet}
            sizes="100vw"
            alt=""
            focalX={slide.focalX}
            focalY={slide.focalY}
            zoom={slide.zoom}
          />
        </div>
      ))}
    </div>
  );
}
