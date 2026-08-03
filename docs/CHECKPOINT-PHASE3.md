# Checkpoint — Phase 3 (Admin unter `/admin`)

**Stand:** 3. August 2026 · **Branch:** `feat/relaunch`

## Was fertig ist

- **Magic-Link-Login** (`/admin/login`, Callback unter `/admin/auth/callback`).
  Passwort-los, PKCE + `token_hash`-Fluss werden beide unterstützt (letzterer
  erlaubt „am Laptop anfordern, am Handy öffnen" — braucht die kleine
  Umstellung der E-Mail-Vorlage aus `docs/ADMIN.md`).
- **Zwei-Stufen-Prüfung:** Middleware verifiziert die Sitzung serverseitig auf
  jedem `/admin`-Aufruf; jede Server-Action prüft zusätzlich per
  `requireAdmin()`, dass die Person in `admins` steht. Ein gültiger Login
  ohne Eintrag in `admins` wird sofort abgemeldet und mit Fehlermeldung
  zurückgeworfen.
- **`admin`-Shell** mit Marke (dunkelgrün, cream, Syne + DM Sans) — dichter
  als die öffentliche Seite, mobil-first, alle Werte aus `tokens.css`. Kein
  neuer Token erfunden.
- **Sidebar:** Übersicht · Inhalte · Team · Karussell · Galerie (soon) ·
  Zitate & Zahlen · Anmeldung & Einstellungen · Nachrichten (soon). Aktive
  Route hervorgehoben, mobil als scrollbare Chip-Leiste.
- **Übersicht** listet alle noch leeren Text- und Bildfelder mit Direktlink
  in den passenden Editor (aus dem Registry berechnet).
- **Inhalte-Editor**, aus `src/content/registry.ts` erzeugt — DE/EN/FR-Reiter,
  „fällt auf Deutsch zurück"-Hinweis, Zeichenzähler, „Ungespeicherte
  Änderungen"-Warnung, Toast beim Speichern, Fehler inline.
- **Team- / Karussell- / Zitate-&-Zahlen-Editoren** mit Drag-Sortierung
  (@dnd-kit), Sichtbar-Schalter, Löschen mit Bestätigungsdialog, der den Namen
  der Karte nennt.
- **Anmeldung & Einstellungen:** Jahr/Datum/Preis/Ort + der
  „Anmeldung offen/geschlossen"-Schalter, mit Vorschau beider Zustände. Die
  öffentliche `/anmeldung`-Seite folgt dem Schalter.
- **Bild-Upload:** neuer Supabase-Bucket `media` (öffentlich lesbar,
  RLS-geschützt beim Schreiben), Migration `20260803205626_media_bucket.sql`
  angewendet. Der Browser komprimiert vor dem Upload zu WebP (max. 2000 px
  lange Kante, q=0.82), bytes fliessen NIE durch Next. Legacy `/Bilder/…`-
  Pfade bleiben gültig, bis sie ersetzt werden.
- **`robots.txt`** blockt `/admin`; `X-Robots-Tag: noindex, nofollow` als
  Header UND als Meta-Tag im Admin-Layout (Belt & braces).
- **Vitest** eingerichtet (`npm test`, `npm run test:watch`) mit 31 Tests
  über `deepMerge`, Preis-/Datums-/Platzhalter-Formatierung, Registry-
  Integrität, `safeAdminPath` (Open-Redirect-Schutz) und `mediaUrl`. Alle
  grün.

## Was du manuell tun musst, bevor es weitergeht

1. **`docs/ADMIN.md` durchgehen** — die drei Punkte im Supabase-Dashboard
   (Signup deaktivieren, URLs setzen, E-Mail-Vorlage anpassen).
2. **Vier Personen einladen** und je eine Zeile in `admins` anlegen. Das
   Briefing spricht von vier Konten; ihr seid drei — überleg dir, wer die
   vierte Person ist (Fallback bei Ausfall?).
3. Sobald du eingeloggt bist: **je einen Text und ein Bild ändern**
   (Checkpoint-Vorgabe). Ich kann dieses Ende-zu-Ende-Verifizieren nicht
   selbst machen, weil ich keinen Admin-Zugang habe — siehe unten.
4. Auf Vercel die drei neuen Umgebungsvariablen prüfen: sie sind seit Phase 2
   dieselben, aber wenn du eine neue Domain aufschaltest, bitte
   `NEXT_PUBLIC_SITE_URL` mitziehen.

## Bewusste Abweichungen vom Briefing

- **Karussell hat einen eigenen Sidebar-Eintrag.** Das Briefing listet ihn
  nicht separat; die Bilder gehören logisch zu „Über uns", sind aber wie
  Team eine Zeilen-Liste. Ich habe sie deshalb neben Team eingehängt statt
  in die Inhalte-Seite zu verstecken. Sag Bescheid, wenn du sie woanders
  willst.
- **Galerie-Upload folgt in Phase 4.** In der Sidebar steht sie dimmbar
  („soon") mit Direktlink, klickt aber ins Leere — das ist Absicht, damit die
  Navigation stabil bleibt.
- **Nachrichten-Posteingang** folgt in Phase 5. Gleiche Behandlung.

## Was ich nicht selbst verifizieren konnte (bitte du prüfen)

- **Ende-zu-Ende-Login** mit echtem Magic-Link — Klick auf den Link im
  Postfach, Landung auf `/admin/auth/callback`, dann `/admin/inhalte/home`.
  Ich habe die Seiten einzeln aufgerufen und den Guard-Redirect verifiziert,
  aber ohne Admin-Konto komme ich nicht in den signed-in Zustand.
- **Bild-Upload** durch den Browser bis in den Bucket. RLS-Policy und
  Bucket-Grenzen habe ich beim Schreiben der Migration doppelt geprüft; der
  Weg selbst braucht einen Login-Klick.
- **`revalidateTag("content")`-Effekt** — nach einem Save sollten öffentliche
  Seiten sofort den neuen Text zeigen, nicht erst nach 5 Minuten. Testbar
  über: DE-Text anpassen → Speichern → `/` in neuem Tab öffnen.

## Bekannte offene Punkte (Phase-übergreifend)

- **npm audit** meldet vier High-Warnungen in Next-Abhängigkeiten (`postcss`,
  `sharp`, `brace-expansion`). Die Fixes verlangen ein Major-Downgrade von
  Next auf 9 — kein sinnvoller Zug. Aktualisierung passiert automatisch,
  sobald `next@15.x` sie mitzieht. Nicht handeln.
- **Bild-Optimierung** (mehrere Grössen, custom loader) kommt wie geplant in
  Phase 7 — die Uploads jetzt liefern EINE Grösse (max. 2000 px WebP), das
  reicht für den Admin, aber nicht für die endgültige Performance.
- **Rate-Limit für Magic Links** liegt bei Supabase-Standard (100/h pro
  E-Mail). Bei Bedarf in Phase 5 gemeinsam mit Resend als SMTP hinterlegen.

## Nächster Schritt

Nach deinem OK, dem Login-Test und dem Speicher-Test: **Phase 4 — Galerie**
(Foto-Upload mit EXIF-Jahr, drei WebP-Grössen, Lightbox, Route Handler
`/api/foto/[id]/[size]` mit `noindex`-Headern). Details in `docs/PLAN.md`.
