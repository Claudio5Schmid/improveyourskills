"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile-Skript konnte nicht geladen werden."));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/**
 * Cloudflare Turnstile, explicit render mode. A token is only proof of a
 * passed challenge to the browser — the actual verification happens
 * server-side in `verifyTurnstile` (`src/lib/contact/turnstile.ts`).
 *
 * Tokens are single-use: mount a fresh instance (change `key` on this
 * component) after any failed submission rather than trying to reset the
 * existing one in place — simpler than the imperative reset API and
 * Turnstile's own render cost is negligible.
 */
export default function TurnstileWidget({
  onToken,
  language,
}: {
  onToken: (token: string) => void;
  language: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const reactId = useId();

  useEffect(() => {
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token: string) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
          language,
          // "normal" is a fixed ~300px — wider than the card on narrow
          // phones, which blew out the grid track (see Kontakt.module.css).
          // "flexible" fills the container's actual width instead.
          size: "flexible",
        });
      })
      .catch((err: unknown) => {
        console.error("[kontakt] Turnstile:", err);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // Mount once per component instance — a fresh instance is requested via `key`, not by re-running this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      id={`turnstile-${reactId}`}
      // Cloudflare's iframe internals can carry a bit of width even in
      // "flexible" mode and after the widget visually collapses to its
      // compact post-challenge state — clip rather than let it push a
      // narrow container (and the grid track it sits in) wider.
      style={{ maxWidth: "100%", overflow: "hidden" }}
    />
  );
}
