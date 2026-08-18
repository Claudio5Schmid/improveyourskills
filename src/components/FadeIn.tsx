"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Reproduces the old IntersectionObserver that added a
 * `visible` class to elements as they entered the viewport (threshold 0.1).
 * Uses the global `.fade-in` / `.fade-in.visible` classes from globals.css.
 *
 * IMPORTANT (Phase 7 fix): the hiding class is NOT rendered on the server.
 * It used to be, which meant every wrapped section sat at `opacity: 0` in the
 * delivered HTML and only became readable once the JS bundle had downloaded
 * AND hydrated. On a slow connection that reads as "the page is still
 * loading" while the text has in fact been there all along — Claudio hit
 * exactly this on /kontakt, whose card is one big FadeIn but only ~150 KB of
 * images. Same principle the hero's `.animate-up` already follows (Phase 6,
 * docs/AUDIT.md §7 Frage 3): content is legible from the first frame, only
 * its motion is an enhancement.
 *
 * So: server + no-JS render plain and visible. After hydration we only "arm"
 * (hide, then reveal on scroll) elements that are still BELOW the fold —
 * where hiding is invisible to the reader anyway. Anything already on screen
 * is left alone rather than being hidden just to fade it back in.
 *
 * Under prefers-reduced-motion the transition is already neutralised via the
 * motion tokens, so an armed element simply appears.
 */
export default function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already on screen when the JS finally ran? Then there is nothing to
    // reveal — leave it plainly visible.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // `className` (layout classes from the caller) is always applied; only the
  // animation classes are conditional.
  const classes = [armed ? "fade-in" : null, armed && visible ? "visible" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes || undefined}>
      {children}
    </div>
  );
}
