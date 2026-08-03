import type { Metadata } from "next";
import { syne, dmSans } from "../fonts";
import "./admin.css";

/**
 * Root layout for the admin. `/admin` deliberately sits OUTSIDE `[locale]`:
 * the admin is German-only and must not be translated or locale-prefixed.
 * This is the second root layout of the app (the public one is
 * `src/app/[locale]/layout.tsx`), so it carries its own <html>/<body>.
 */
export const metadata: Metadata = {
  title: "Admin · Improve your skills",
  // Belt and braces: this meta tag, the X-Robots-Tag header in next.config.ts
  // and the Disallow in robots.ts all say the same thing.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
