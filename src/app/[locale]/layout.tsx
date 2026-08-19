import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site-url";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import { syne, dmSans } from "../fonts";
import "../globals.css";

/**
 * Site-wide defaults. Every public page overrides title/description via its
 * own `generateMetadata` (src/lib/seo.ts) — this is only what's left when a
 * route doesn't (there currently isn't one, this is the safety net).
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Improve your skills",
    template: "%s · Improve your skills",
  },
  description:
    "Unihockey Skill Training in Uster für U14 Männer & U17 Frauen, geleitet von drei Schweizer Nationalspieler:innen.",
  robots: { index: true, follow: true },
};

/**
 * Force dynamic rendering — deliberately no `generateStaticParams` here.
 * The CSP in `src/middleware.ts` gives every `<script>` tag a fresh nonce
 * per request (see `src/lib/csp.ts`), but a statically prerendered/cached
 * page bakes in whatever nonce (or none) was present at cache time, which
 * then never matches the fresh nonce on the response header. The mismatch
 * makes the browser silently block every script on the page: no mobile
 * menu, no language switcher, no nav scroll-background, nothing. `next dev`
 * never shows this (nothing is cached there), which is why it only surfaced
 * in production. Next's own docs are explicit about this: per-request
 * nonces require dynamic rendering. Traffic here is low enough that losing
 * ISR caching is the right trade for a working site.
 */
export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
