"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Ueber.module.css";
import type { LocalizedStat } from "@/content/content";

/**
 * Splits "500+" into { number: 500, prefix: "", suffix: "+" } so the digits
 * can be animated while any surrounding characters stay put. A value with no
 * digits at all (`number: null`) is rendered as-is, unanimated — no crash on
 * unexpected admin input.
 */
function parseValue(raw: string): { number: number | null; prefix: string; suffix: string } {
  const match = raw.match(/^(\D*)(\d+)(\D*)$/);
  if (!match) return { number: null, prefix: "", suffix: raw };
  const [, prefix, digits, suffix] = match;
  return { number: parseInt(digits, 10), prefix, suffix };
}

/**
 * Always starts (and stays, until scrolled into view) at the real final
 * value — that's what a no-JS visitor and the very first paint see. Only once
 * IntersectionObserver confirms it's actually on screen does it drop to 0 and
 * count back up; `prefers-reduced-motion` skips that entirely.
 */
function StatNumber({ value }: { value: string }) {
  const { number, prefix, suffix } = parseValue(value);
  const finalDisplay = number === null ? value : `${prefix}${number}${suffix}`;
  const [display, setDisplay] = useState(finalDisplay);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (number === null || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    // Tracked so cleanup can cancel a still-running loop — without this, React
    // Strict Mode's dev-only mount→cleanup→mount (or a fast-refresh reload)
    // left a stale rAF loop alive fighting a fresh one over the same <span>,
    // which could freeze the display mid-count. Doesn't affect the production
    // build (no double-invoke there), but a leaked loop is a real bug either way.
    let frameId: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || animated.current) return;
        animated.current = true;
        observer.disconnect();

        const duration = 1500;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic, echoes tokens.css's --easing
          setDisplay(`${prefix}${Math.round(number * eased)}${suffix}`);
          frameId = progress < 1 ? requestAnimationFrame(step) : null;
        };
        frameId = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [number, prefix, suffix]);

  return <span ref={ref}>{display}</span>;
}

/** Renders nothing if there are no visible stats — no empty band, no fake numbers. */
export default function StatsBand({ stats }: { stats: LocalizedStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className={styles.statsBand}>
      <div className="container">
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statItem}>
              <div className={styles.statValue}>
                <StatNumber value={stat.value} />
              </div>
              {stat.label && <div className={styles.statLabel}>{stat.label}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
