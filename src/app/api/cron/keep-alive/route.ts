import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const runtime = "nodejs";
// Never cached: the whole point is that this actually reaches the database
// every single time it runs.
export const dynamic = "force-dynamic";

/**
 * Supabase keep-alive (brief §Phase 7, CLAUDE.md "free-tier constraints").
 *
 * Supabase pauses free projects after ~7 days without activity. A paused
 * project doesn't answer queries, so the site would fall back to its bundled
 * German copy — no admin-edited text, no uploaded images — until someone
 * noticed and un-paused it by hand. This route does one trivial read to keep
 * the project counted as active; `vercel.json` calls it once a day (the most
 * the Hobby plan allows, which is ample against a 7-day timer).
 *
 * Reads `site_settings` through the ANON client on purpose: it is a single
 * row, public-read under RLS, and needs no service-role key — the least
 * privilege that still proves the database answered.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET` whenever that
 * env var is set. We require it and fail closed if it is missing, rather than
 * leaving an unauthenticated endpoint that anyone could hit to make us query
 * the database. A misconfiguration therefore shows up as a failing cron in
 * the Vercel dashboard instead of silently becoming a public endpoint.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/keep-alive] CRON_SECRET is not set — refusing to run.");
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 503, headers: NOINDEX }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401, headers: NOINDEX });
  }

  if (!hasSupabaseEnv()) {
    console.error("[cron/keep-alive] Supabase env missing — nothing to ping.");
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 503, headers: NOINDEX }
    );
  }

  const startedAt = Date.now();
  try {
    const supabase = createPublicClient();
    const { error } = await supabase
      .from("site_settings")
      .select("current_edition_year")
      .limit(1)
      .maybeSingle();

    const ms = Date.now() - startedAt;

    if (error) {
      // Logged, not thrown: a non-2xx here is the signal Vercel surfaces.
      console.error(`[cron/keep-alive] query failed after ${ms}ms:`, error.message);
      return NextResponse.json({ ok: false, ms, error: error.message }, { status: 500, headers: NOINDEX });
    }

    console.log(`[cron/keep-alive] ok in ${ms}ms`);
    return NextResponse.json({ ok: true, ms }, { headers: NOINDEX });
  } catch (e) {
    const ms = Date.now() - startedAt;
    const message = e instanceof Error ? e.message : "unknown error";
    console.error(`[cron/keep-alive] threw after ${ms}ms:`, message);
    return NextResponse.json({ ok: false, ms, error: message }, { status: 500, headers: NOINDEX });
  }
}

const NOINDEX = { "X-Robots-Tag": "noindex, nofollow" };
