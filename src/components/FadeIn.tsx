"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Reproduces the old IntersectionObserver that added a
 * `visible` class to elements as they entered the viewport (threshold 0.1).
 * Uses the global `.fade-in` / `.fade-in.visible` classes from globals.css.
 *
 * Under prefers-reduced-motion the transition is already neutralised via the
 * motion tokens, so the element simply appears.
 */
export default function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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

  return (
    <div
      ref={ref}
      className={`fade-in${visible ? " visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
