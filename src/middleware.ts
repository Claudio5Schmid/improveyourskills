import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";
import { supabaseAnonKey, supabaseUrl, hasSupabaseEnv } from "./lib/supabase/env";

const intlMiddleware = createMiddleware(routing);

/** Admin paths reachable without a session — the login page and the e-mail link. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/auth/callback"];

/**
 * Guard for `/admin`. Verifies the session server-side on every request and
 * refreshes the Supabase auth cookies (they are short-lived; without this the
 * admin would be logged out after an hour).
 *
 * Membership in the `admins` table is checked one layer further in, in
 * `getAdminSession()` — the middleware answers "is this a valid session?", the
 * layout and every Server Action answer "is this person an admin?".
 */
async function adminMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const isPublicPath = PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Without Supabase configured nobody can log in — say so instead of looping
  // between /admin and /admin/login.
  if (!hasSupabaseEnv()) {
    if (isPublicPath) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "?fehler=konfiguration";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() (not getSession()) — this one verifies the token with the auth
  // server instead of trusting the cookie's contents.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Remember where they wanted to go, so the login can send them back.
    url.search = pathname === "/admin" ? "" : `?weiter=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  // Everything else is the public, localised site.
  return intlMiddleware(request);
}

export const config = {
  /**
   * Run on everything EXCEPT:
   *  - `/api/…`           (route handlers)
   *  - `/_next`, `/_vercel` (framework internals)
   *  - any path containing a dot (`favicon.svg`, images, and the old `*.html`
   *    URLs — those are handled by the 301 redirects in next.config.ts).
   *
   * `/admin` matches this pattern and is branched off above: the locale
   * middleware must never touch it, or `/admin` would be rewritten to the
   * non-existent `/de/admin`.
   */
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
