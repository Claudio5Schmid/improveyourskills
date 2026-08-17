import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site-url";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
      </body>
    </html>
  );
}
