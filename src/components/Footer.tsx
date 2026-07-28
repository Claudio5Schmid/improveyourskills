import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Site footer. Replaces the markup copied into all six pages.
 *
 * `info` reproduces the old per-page footer line exactly (see docs/AUDIT.md §5.1):
 *  - "none"      → home, impressionen, kontakt (no venue line)
 *  - "venue"     → anmeldung
 *  - "venueDate" → ueber, impressum
 * Phase 2 unifies this via site_settings; for the Phase-1 parity check it is
 * reproduced faithfully.
 */
export default function Footer({ info = "none" }: { info?: "none" | "venue" | "venueDate" }) {
  const t = useTranslations("footer");
  const tc = useTranslations("common");

  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">{tc("brand")}</div>
          {info !== "none" && (
            <div className="footer-info">{info === "venue" ? t("venue") : t("venueDate")}</div>
          )}
          <div className="footer-org">{t("org")}</div>
          <div className="footer-links">
            <Link href="/kontakt">{t("contactLink")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
