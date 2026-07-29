# Claude Code Brief — improveyourskills.ch Rebuild

> **How to use this file:** Work phase by phase. Each phase ends with an explicit
> checkpoint — stop, summarise, and wait for the go-ahead before the next phase.
>
> **Hosting note:** This brief targets **Vercel** as the host (migrated from an
> earlier Netlify plan). All hosting-specific guidance below is Vercel.

---

## 0. Context and non-negotiables

I run **improveyourskills.ch**, a Swiss non-profit-style project offering unihockey
(floorball) skill training in Uster for U14 boys and U17 girls. It is organised by
three national team players: Vanessa Schmuki, Pascal Schmuki and Claudio Schmid. The
site is currently a hand-written static HTML/CSS/JS site hosted on GitHub Pages,
domain registered at Hostpoint.

You are rebuilding it as a professional, dynamic, editable website. Read this entire
brief before writing any code.

### Absolute rules — violating any of these fails the task

1. **THE BRAND MUST NOT CHANGE.** The dark green, the cream/beige, the heavy display
   headline typeface, the pill-shaped badges, the rounded cards, the overall visual
   language — all of it stays byte-for-byte identical. You extract these values from
   the existing CSS. You do **not** redesign, "modernise", "improve", or substitute
   the palette or typography. If a font or colour is ambiguous, stop and ask me
   rather than guessing.
2. **Do not invent or hardcode a new colour or font anywhere.** Every colour, font,
   radius, shadow and spacing value must come from the token file you generate in
   Phase 0. If you need a new value (e.g. an error red for form validation), derive
   it from the existing palette and list it explicitly in your report for my approval.
3. **Do not write your own authentication logic.** No password hashing, no session
   handling, no JWT signing, no "simple login check". Use Supabase Auth exclusively
   (managed third-party auth). Magic-link only, no passwords.
4. **Never commit secrets.** `.env*` files stay in `.gitignore`. The Supabase service
   role key exists only in Vercel environment variables and is used only in
   server-side code, never in anything shipped to the browser.
5. **Work on a branch.** Create `feat/relaunch` and work there. Never force-push,
   never rewrite history, never delete the existing site until I have confirmed
   parity. Ask before any destructive git operation.
6. **One phase at a time.** After each phase, stop, summarise what changed, list what
   I need to do manually (DNS, dashboard settings, env vars), and wait for my go-ahead.

### Target stack

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router, TypeScript)** |
| Styling | Plain CSS / CSS Modules with CSS custom properties, ported from the existing stylesheet. **Do not introduce Tailwind or any UI kit** — it would fight the existing hand-written styles. |
| Hosting | **Vercel** (migrating away from GitHub Pages) |
| Backend / DB / Storage / Auth | **Supabase**, free tier, EU Central region |
| Transactional email | **Resend** (free tier) |
| Spam protection | **Cloudflare Turnstile** (free) |
| Analytics | **Cloudflare Web Analytics** (free, cookieless, no consent banner required) |
| i18n | **next-intl**, locales `de` (default), `en`, `fr` |

### Free-tier constraints you must design around

- **Supabase free projects pause after ~7 days of inactivity.** Implement a scheduled
  **Vercel Cron Job** that runs **daily** and performs a trivial read against the
  database to keep the project alive. Log it. (The Vercel Hobby plan limits cron jobs
  to daily execution — daily is plenty for the 7-day pause window.)
- **Supabase Image Transformation is a paid feature — it is not available.** All
  resizing happens client-side at upload time; multiple sizes are stored in Storage.
  Never rely on `?width=` transformation URLs.
- Storage budget: 1 GB. Database: 500 MB. Design the image pipeline to stay
  comfortably inside that (target: a full year of ~200 gallery photos under ~150 MB
  total across all sizes).
- Vercel free build minutes are limited — keep the build fast, avoid heavy image
  processing at build time.

---

## Phase 0 — Audit, design tokens, and plan

**Do not write any application code in this phase.**

1. Read every existing file: all HTML, all CSS, all JS, all assets.
2. Produce `docs/AUDIT.md`: full inventory of every page, section, text string and
   image with exact current copy; every image asset with file size and pixel
   dimensions, largest first; how fonts are currently loaded; any JS behaviour that
   must be preserved (e.g. the Über-uns carousel).
3. Produce `src/styles/tokens.css` — every colour, font stack, weight, size, line
   height, letter spacing, radius, shadow, spacing step and breakpoint from the
   existing CSS, as CSS custom properties with descriptive names, each with a comment
   naming the file and line it came from.
4. Produce `docs/PLAN.md`: implementation plan for Phases 1–7, with risks/open
   questions.
5. **Report back and wait.**

---

## Phase 1 — Next.js migration with pixel-identical output

Goal: the exact same website, visually indistinguishable, on Next.js and deployed to
Vercel. No new features yet.

1. Scaffold Next.js (App Router, TypeScript). Set up ESLint and Prettier.
2. Port each page to a clean route — no `.html` anywhere:
   `/` · `/ueber-uns` · `/impressionen` · `/kontakt` · `/anmeldung`.
3. Add permanent **301 redirects** from every old `.html` URL to the new one, in
   `next.config.ts` so they survive any hosting change.
4. Port the CSS using `tokens.css` as the single source of truth, imported globally.
   Component styles as CSS Modules. **Zero visual drift.**
5. Fonts: if the current stack is system fonts, keep it exactly. If a webfont is used,
   self-host it via `next/font` with `display: swap` and preload. Never swap in a
   "similar" font.
6. Set up **next-intl** with `de` default (no prefix), `en`/`fr` under `/en/…` and
   `/fr/…`. Discreet language switcher matching the existing nav. Extract all German
   copy into `messages/de.json`, copy verbatim into `en.json`/`fr.json`; untranslated
   keys fall back to German.
7. **Responsive:** mobile-first CSS. Verify and fix layout at 320, 375, 390, 768,
   1024, 1280, 1440 and 1920 px plus landscape phone. Tap targets ≥ 44 px. No
   horizontal scrolling at any width. Test the mobile navigation thoroughly.
8. Deploy to Vercel from the `feat/relaunch` branch as a preview deploy. Do **not**
   repoint the Hostpoint DNS yet.
9. **Checkpoint:** before/after screenshots at 375, 768 and 1440 px for every page.
   List the exact DNS records I will later add at Hostpoint (Vercel's `A`/`CNAME`
   records plus `www` handling) — but do not tell me to change them yet.

---

## Phase 2 — Supabase: schema, security, content wiring

- Initialise the Supabase CLI in the repo with proper migration files. Every schema
  change is a versioned SQL migration — no manual dashboard clicking for schema.
- **Content model** edited through a small structured admin (not a free-form page
  builder): a generic `content_blocks` key/value store (text/longtext/image/url/bool,
  `value_de/en/fr`, `image_path`, `image_alt_de/en/fr`, `updated_at/by`). A typed
  registry file (`src/content/registry.ts`) lists valid keys, kind, German label, help
  text, char limit, page/section — the admin UI is generated from it. Seed from the
  live copy.
- Tables: `content_blocks`, `team_members`, `carousel_images`, `testimonials`,
  `stats`, `gallery_photos`, `contact_messages`, `site_settings`, `admins`.
- **RLS on every table, no exceptions.** `anon` = SELECT only on visible rows;
  hidden gallery photos never returned to anon; `contact_messages` has no anon access
  at all (inserts only via a server route using the service-role key after Turnstile).
  Writes only for authenticated users whose `auth.uid()` is in `admins` (all four
  equal, no hierarchy). Write `docs/RLS.md` in plain German with SQL tests proving
  anon can't read messages, can't read hidden photos, can't write.
- **Year/date neutrality:** nothing about a year, date or price is hardcoded. Every
  such value comes from `site_settings` / `content_blocks`. Clear, safe open/closed
  switch for the Anmeldung page with a preview of each state.
- Server Components fetch content; `revalidate = 300` plus on-demand revalidation on
  save. No drafts/history — saving publishes immediately. Every destructive action
  needs a confirmation dialog naming the item.
- **Checkpoint:** schema diagram, migration files, RLS test output.

---

## Phase 3 — Admin area at `/admin`

- **Supabase Auth, magic link only.** Public sign-up disabled (document where to click
  in the dashboard, in German). Four users initially; an `admins` table maps
  `auth.uid()` to a display name. Middleware protects every `/admin` route and admin
  API — server-side session verification. `noindex, nofollow` + excluded in robots.
- German interface, visually part of the brand but denser. Sidebar: Inhalte · Team ·
  Galerie · Zitate & Zahlen · Anmeldung & Einstellungen · Nachrichten.
- Text fields: DE/EN/FR tabs, DE required, "fällt auf Deutsch zurück" hint, char
  counters, unsaved-changes warning. Image fields: drag-drop upload, live preview,
  replace, per-language alt text, a clear "Platzhalter — noch kein Bild" state and a
  dashboard banner listing every unfilled placeholder. Toast on save, inline error on
  failure.
- **Checkpoint:** walk through inviting a user and editing one text and one image.

---

## Phase 4 — Impressionen gallery

Replaces the external OneDrive link. Photos live on our own site — an impression, not
a distribution service (no downloads, no full-res originals to the public).

- Organised by **year** only. Filter chips (badge/pill style): `Alle` + one per year
  with visible photos; default = most recent year; year list derived from data. Filter
  client-side, reflected in `?jahr=YYYY`. Masonry/mixed-aspect grid, brand colours.
- **Viewer:** full-screen lightbox, creative but on-brand; keyboard nav (arrows, Esc),
  swipe, preload next, no layout shift, graceful on slow connections,
  `prefers-reduced-motion` respected. No captions.
- **Upload (must be effortless):** drop a folder / multi-select; per file read EXIF
  `DateTimeOriginal` (exifr) to pre-fill year (fallback file mtime, then current
  edition year), override per file or batch; auto-rotate then **strip all EXIF**
  (no GPS on our server); client-side compress to three WebP variants (thumb ~480px
  q72, medium ~1200px q78, large ~2000px q80), store intrinsic w/h; tiny blurred
  base64 placeholder; parallel upload with per-file + overall progress, retry, summary.
  Path `gallery/{year}/{uuid}_{size}.webp`. After upload: reorder by drag, per-photo
  "Foto verbergen" (takedown), delete with confirmation (also deletes all three files).
- **Privacy:** Storage bucket private; public access via a Next route handler
  (`/api/foto/[id]/[size]`) that checks `hidden = false` and streams / signs, setting
  `X-Robots-Tag: noindex, noimageindex, nofollow`. `robots.txt` disallows `/api/foto/`.
  `/impressionen` may be indexed but carries `<meta name="robots" content="noimageindex">`.
  Sensible long `Cache-Control` with immutable filenames. Disable context menu /
  drag-save as a friction layer (documented as friction, not real protection). Never
  render a direct Supabase Storage URL in HTML.
- **Checkpoint:** upload 30 mixed photos; show timing, file sizes, Lighthouse score.

---

## Phase 5 — Contact form

Replaces the `mailto:` link. Fields: Vorname*, Name*, E-Mail*, Nachricht*, required
consent checkbox linking the privacy policy.

- Inline validation in the visitor's language, brand style, never clearing the message
  on error. Server route + Zod validation. **Cloudflare Turnstile** verified
  server-side, honeypot, per-IP rate limit (IP stored only as a salted hash).
- On success: store the message **and** send the email; if email fails, the message is
  still stored, the visitor still sees success, the failure is logged and surfaced in
  the admin. Email to `pascal.schmuki@bluewin.ch` via Resend with the sender in
  `Reply-To`, subject includes the sender name; auto-reply to the sender in their
  language. Clear on-page success state.
- **Admin inbox:** newest first, unread bold + count badge, mark read/unread, mailto
  reply, delete with confirmation. No public access.
- Document (German) the exact Resend steps and the DNS records (SPF, DKIM, DMARC) for
  Hostpoint; note that until the domain is verified only a test sender works.

---

## Phase 6 — Über uns redesign and richer imagery

More engaging, **no new design language** — everything from existing tokens/patterns.
Keep the badges, carousel, "Etwas zurückgeben." section, feature boxes, trainer cards.
Add: a **stats band** (from `stats`, count-up on scroll), a **testimonial section**
(from `testimonials`), **better trainer cards** (larger photos, subtle hover, stronger
club/national line), **more imagery** across the site (each an editable image field
with a placeholder state — no invented stock), and **tasteful motion** (scroll reveals,
staggered entrances, gentle parallax, smooth hover) that never delays readability,
never shifts layout, never hurts Lighthouse, is disabled under
`prefers-reduced-motion`, and does not animate the first viewport of the homepage.

---

## Phase 7 — Performance, SEO, legal, launch

- **Performance:** every image WebP with `srcset`/`sizes` from pre-generated variants,
  via a **custom Next.js image loader** (we deliberately do **not** use Vercel Image
  Optimization, to avoid its quota). Explicit width/height everywhere → **CLS 0**.
  Above-the-fold hero preloaded; everything else lazy with blur placeholder.
  Self-hosted fonts, preloaded, `display: swap`. Targets (mobile, throttled):
  Lighthouse Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95; LCP < 2.5s,
  CLS < 0.1, INP < 200ms. Report actual numbers. Delete old oversized assets once
  migrated.
- **SEO:** per-page/-language title + description via `content_blocks`; Open Graph /
  Twitter images; `hreflang` + canonicals; dynamic `sitemap.xml` (incl. gallery years);
  `robots.txt` with the exclusions above; JSON-LD (`SportsActivityLocation`/`Event` +
  `Organization` with venue address); favicon + app icons in the brand.
- **Legal (revDSG):** create `/impressum` and `/datenschutz` in all three languages,
  pre-filled structured drafts (who we are, contact-form data + retention, Supabase &
  Vercel as processors and where data lives, Cloudflare Turnstile + cookieless
  analytics, photo publication + removal right, data-subject rights). Marked clearly as
  a draft I must review — not legal advice. Linked from the footer. **No cookie banner**
  (only strictly necessary Supabase auth session for logged-in admins; analytics
  cookieless) — state this reasoning in `docs/`.
- **Analytics:** integrate Cloudflare Web Analytics; document reading the dashboard.
- **Launch:** set up all Vercel environment variables (list each with its purpose);
  configure security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy) **in `next.config.ts`** — a CSP that actually works with Supabase,
  Turnstile and Cloudflare, tested. Precise, ordered, German Hostpoint checklist for
  pointing the domain at Vercel (exact records, `www` vs apex, TTL advice, verify
  before/after, rollback step). Verify all 301 redirects in production. Set up the
  **daily** Supabase keep-alive Vercel Cron Job.

---

## Documentation deliverables (German, for a non-developer)

In `docs/`: `ANLEITUNG.md` (how to log in, edit text, swap an image, upload a gallery
year, open/close registration, read messages — for colleagues, not developers);
`BETRIEB.md` (what to do when something breaks, where the logs are, how to restore,
free-tier limits and what happens near them, and specifically what to do if the
Supabase project pauses); `ENTWICKLUNG.md` (local setup, migrations, deploy flow);
plus `RLS.md`, `AUDIT.md`, `PLAN.md`. A `CLAUDE.md` in the repo root captures the brand
rules and architecture decisions.

---

## Testing

Type-check and lint clean. Unit tests for year/EXIF detection, image compression,
form validation and locale fallback. An end-to-end test (Playwright): visitor submits
the contact form; admin logs in via magic link and edits a text; a hidden gallery photo
is not returned to an anonymous client. Manual cross-browser: Safari (macOS + iOS),
Chrome, Firefox — check iOS Safari properly.

---

## How to work with me

Ask before installing any dependency not in the stack table (justify it). If anything
is ambiguous or you find a better approach, ask before deviating — especially anything
touching the brand. Small, descriptive commits, English, conventional-commit style.
At each checkpoint: what you did, what changed visually, what I must do manually,
what's still open, and any risk you noticed. I am not a professional developer — explain
decisions in plain language and tell me when something is a trade-off rather than an
obvious win.
