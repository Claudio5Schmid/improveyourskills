import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings, formatCourseDate } from "@/content/content";

/**
 * Site footer. `info` selects the per-page venue line (see docs/AUDIT.md §5.1):
 *  - "none"      → home, impressionen, kontakt
 *  - "venue"     → anmeldung   (venue only)
 *  - "venueDate" → ueber, impressum   (venue + course date)
 *
 * Phase 2 composes that line from site_settings (venue + course date), so it
 * updates everywhere when the settings change. If the DB is unreachable it falls
 * back to the bundled copy.
 */
export default async function Footer({ info = "none" }: { info?: "none" | "venue" | "venueDate" }) {
  const t = await getTranslations("footer");
  const tc = await getTranslations("common");
  const settings = await getSettings();

  let infoLine = "";
  if (info !== "none") {
    if (settings) {
      const parts = [settings.venue_name, settings.venue_address].filter(Boolean) as string[];
      if (info === "venueDate") {
        const date = formatCourseDate(settings.course_date);
        if (date) parts.push(date);
      }
      infoLine = parts.join(" · ");
    } else {
      infoLine = info === "venue" ? t("venue") : t("venueDate");
    }
  }

  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">{tc("brand")}</div>
          {infoLine && <div className="footer-info">{infoLine}</div>}
          <div className="footer-org">{t("org")}</div>
          <div className="footer-links">
            <Link href="/kontakt">{t("contactLink")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
