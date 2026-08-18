"use client";

import { useEffect, useState } from "react";

/** How long after mount the "load the next slide too" step kicks in. */
const PRELOAD_AFTER_MS = 1200;

/**
 * Decides which slides of a cross-fading slider should actually render an
 * `<img>` at all (Phase 7 performance fix).
 *
 * The problem this solves: both sliders stack every slide absolutely in the
 * same spot. They are therefore ALL inside the viewport as far as the browser
 * is concerned, so `loading="lazy"` does nothing — every slide downloads on
 * page load even though exactly one is ever visible. On /ueber-uns that meant
 * four full-size carousel photos (~2.4 MB) competing with everything else on
 * first paint; Claudio measured this as roughly ten seconds.
 *
 * The fix is to control mounting rather than loading: render only the current
 * slide, and pull in the next one once the initial load has settled — well
 * before either slider's 5–6 s autoplay would need it, so the cross-fade
 * still has a decoded image ready and looks unchanged.
 *
 * Returns a predicate: `shouldMount(i)`.
 */
export function useMountedSlides(count: number, current: number): (index: number) => boolean {
  const [mounted, setMounted] = useState<number[]>([0]);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSettled(true), PRELOAD_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    setMounted((prev) => {
      const next = new Set(prev);
      next.add(current);
      // Only look ahead once the page has settled — pre-loading slide 2 while
      // slide 1 is still the LCP candidate is exactly the competition we are
      // trying to remove.
      if (settled) next.add((current + 1) % count);
      return next.size === prev.length ? prev : Array.from(next);
    });
  }, [current, count, settled]);

  return (index: number) => mounted.includes(index);
}
