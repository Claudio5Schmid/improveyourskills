import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Run the locale middleware on everything EXCEPT:
   *  - `/api/…`           (route handlers, added in later phases)
   *  - `/_next`, `/_vercel` (framework internals)
   *  - any path containing a dot (`favicon.svg`, images, and the old `*.html`
   *    URLs — those are handled by the 301 redirects in next.config.ts).
   */
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
