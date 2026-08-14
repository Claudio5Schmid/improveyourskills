"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import PositionedImage from "@/components/PositionedImage";
import styles from "./Impressionen.module.css";
import type { GalleryPhoto } from "@/lib/gallery/data";

interface LightboxProps {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Full-screen photo viewer. Keyboard (arrows, Esc), swipe, preload-next, no
 * layout shift (aspect-ratio reserved from the stored `large` dimensions,
 * blur-up placeholder shown underneath while it loads), no captions.
 *
 * Focus-trap follows the exact same pattern as the mobile nav menu
 * (`Nav.tsx`) — Tab wraps between the first and last control instead of
 * escaping into the page underneath.
 */
export default function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const t = useTranslations("impressionen.lightbox");
  const photo = photos[index];
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const goPrev = () => onNavigate((index - 1 + photos.length) % photos.length);
  const goNext = () => onNavigate((index + 1) % photos.length);

  // Preload the next photo's full-size image so arrow/swipe navigation feels instant.
  useEffect(() => {
    const next = photos[(index + 1) % photos.length];
    if (next && next.id !== photo?.id) {
      const preload = new Image();
      preload.src = `/api/foto/${next.id}/large`;
    }
  }, [index, photos, photo?.id]);

  useEffect(() => {
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      containerRef.current
        ? Array.from(containerRef.current.querySelectorAll<HTMLElement>("button"))
        : [];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "Tab") {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!photo) return null;

  const aspectRatio =
    photo.large.width && photo.large.height ? `${photo.large.width} / ${photo.large.height}` : undefined;

  return (
    <div
      ref={containerRef}
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 50) return;
        if (delta > 0) goPrev();
        else goNext();
      }}
    >
      <button ref={closeRef} type="button" className={styles.lightboxClose} onClick={onClose} aria-label={t("close")}>
        ✕
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className={styles.lightboxPrev}
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={t("prev")}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.lightboxNext}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={t("next")}
          >
            ›
          </button>
        </>
      )}

      <div
        className={styles.lightboxImgWrap}
        style={{ aspectRatio, backgroundImage: photo.blurDataUrl ? `url(${photo.blurDataUrl})` : undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        <PositionedImage
          key={photo.id}
          src={`/api/foto/${photo.id}/large`}
          alt=""
          focalX={photo.focalX}
          focalY={photo.focalY}
          zoom={photo.zoom}
          className={styles.lightboxImg}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {photos.length > 1 && (
        <div className={styles.lightboxCounter}>{t("counter", { n: index + 1, total: photos.length })}</div>
      )}
    </div>
  );
}
