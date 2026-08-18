# CLAUDE.md — improveyourskills.ch

Guidance for any future session working in this repo. Read this first, then
`docs/PLAN.md` for the phase roadmap and `docs/AUDIT.md` for the original site.
The canonical spec is `PROJECT_BRIEF.md`.

## What this is

A rebuild of the hand-written static site (was GitHub Pages) into a dynamic,
editable website for a Swiss non-profit floorball skill-training project in Uster
(U14 boys, U17 girls), run by three national-team players: Vanessa Schmuki,
Pascal Schmuki & Claudio Schmid. The user, **Claudio**, is not a developer —
explain decisions in plain language (German is welcome for anything he reads),
and flag trade-offs honestly.

## Iron rules (do not break)

1. **The brand does not change.** Dark green `#102C26`, cream `#F7E7CE`, Syne
   (display) + DM Sans (body), pill badges, rounded cards. Every colour, font,
   radius, shadow and spacing value comes from `src/styles/tokens.css`, which was
   extracted from the old `style.css` with a source-line comment on each token.
   **Never invent a colour/font/radius.** There is already a red for errors
   (`#c94a4a` / `#8b1a1a`) — reuse it. If a genuinely new value is unavoidable,
   add it to `tokens.css`, derive it from the palette, and flag it for approval.
2. **No self-written auth.** Supabase Auth only, magic-link only, no passwords.
3. **Never commit secrets.** `.env*` is gitignored. The Supabase service-role key
   lives only in Vercel env vars and only in server-side code.
4. **Work on `feat/relaunch`.** `main` = the live site; leave it untouched until
   the user confirms parity. No force-push, no history rewrite. Ask before any
   destructive git op or before pushing.
5. **One phase at a time.** Stop at each checkpoint; wait for the go-ahead.

## Stack & hosting

- **Next.js 15** (App Router, TypeScript) · **React 19**.
- **Hosting: Vercel** (Hobby plan). Next.js is auto-detected — no hoster config
  file. Redirects and security headers live in `next.config.ts` (hoster-
  independent), **not** in `vercel.json`.
- **Supabase** (Auth/DB/Storage, EU/CH region) — from Phase 2.
- **Resend** (email), **Cloudflare Turnstile** (spam), **Cloudflare Web Analytics**
  (cookieless) — later phases.
- **next-intl** v4: `de` default (no prefix), `/en` and `/fr` prefixed; missing
  keys fall back to German via `deepMerge` (`src/i18n/deep-merge.ts`).
- Styling: **plain CSS + CSS Modules**. No Tailwind, no UI kit. `globals.css` holds
  the reset + shared design-system classes; page-specific styles are co-located
  `*.module.css`.

## Free-tier constraints to design around

- Supabase free projects pause after ~7 days idle → a **daily Vercel Cron Job**
  (Hobby crons run at most daily) does a trivial DB read to keep it warm.
- Supabase Image Transformation is paid → **not used**. Resize client-side at
  upload, store multiple WebP sizes in Storage.
- We deliberately do **not** use Vercel Image Optimization (quota) — a **custom
  Next.js image loader** maps to our stored sizes.
- Budgets: Storage 1 GB, DB 500 MB. Keep the gallery well inside.

## Conventions established in Phase 1

- Images currently live in `public/Bilder/` (Phase 7 replaces them with the WebP
  pipeline). The old `.html` files + `style.css` stay at the repo root as the
  parity reference until the user confirms; they are not served by Next.
- Shared components in `src/components/`; page sections co-located under the route.
- Nav has two variants: `hero` (home, transparent→solid past 60px) and `page`
  (subpages, solid). Mobile menu is accessible (aria-expanded, focus trap, Esc,
  scroll lock). Tap targets are ≥44px, expanded invisibly via `::before`.
- All user-facing copy is in `messages/{de,en,fr}.json`. `en`/`fr` are verbatim
  German copies until real translations arrive. Phase 2 moves editable copy to
  Supabase `content_blocks` (registry-driven).
- Motion respects `prefers-reduced-motion` (wired through the motion tokens).
- `docs/PLATZHALTER.md` tracks every unfilled image/text placeholder.

## Decisions on record (see `docs/AUDIT.md §7`)

Fonts self-hosted; the wordmark IS the logo (real brand treatment is a later,
explicit goal); hero entrance animation kept but must stay readable-immediately
(Phase 6); Google Maps is click-to-load; photo consent covers the gallery but the
Impressum text must be rewritten (Phase 7); the on-site gallery is a curated
~20–30 photos/year subset (OneDrive stays the parents' full-res channel); EN/FR
are nice-to-have.

## Working style

Small, descriptive commits, English, conventional-commit style, each ending with
the Co-Authored-By trailer. Verify visually in the browser before claiming a page
is done. Report outcomes faithfully — if something is deferred or unverified, say
so. At each checkpoint: what changed, what the user must do manually, what's open,
what risks you saw.
