# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primär: Eltern.** Zu ~90 % melden die Eltern das Kind an. Sie kommen über eine
Empfehlung (Verein, Trainer:in, andere Eltern) oder einen direkten Link auf die
Seite, meist auf dem Handy, und prüfen in wenigen Minuten: Ist das seriös? Wer
sind diese Leute? Ist mein Kind dort gut aufgehoben? Was kostet es, wann, wo?
Ihre Aufgabe ist eine Vertrauensentscheidung, nicht eine Produktrecherche.

**Sekundär: die Jugendlichen selbst** (U14 Männer, U17 Frauen). Sie schauen sich
die Seite an und wollen Lust bekommen — Bilder, Trainer:innen, Atmosphäre —, aber
sie schliessen die Anmeldung nicht ab.

**Dritte Gruppe: Eltern nach dem Camp.** Sie kommen zurück, um die Impressionen
anzusehen. Für sie ist die Seite Erinnerung, nicht Verkauf.

## Product Purpose

improveyourskills.ch ist die Website eines privaten, nicht-kommerziellen
Unihockey-Skill-Trainings in Uster (Buchholz Sporthalle), organisiert von den
drei Schweizer Nationalspieler:innen Vanessa Schmuki, Pascal Schmuki und Claudio
Schmid. Ein Tagescamp pro Jahr, max. ~30 Kinder, CHF 48.–.

Die Seite muss drei Dinge leisten:

1. **Vertrauen herstellen** — Eltern und Umfeld (Halle, Verein, mögliche Partner)
   sollen sofort sehen, dass das seriös, professionell und für ein Kind sicher ist.
2. **Aufwand vom Team nehmen** — alle Antworten stehen auf der Seite, damit
   weniger per Mail und WhatsApp nachgefragt wird; und das Team pflegt die
   Inhalte selbst, ohne Entwickler.
3. **Erinnerung sein** — die kuratierte Foto-Galerie hält das Erlebnis fest und
   holt Familien nach dem Camp zurück auf die Seite.

Ausdrücklich **nicht** das Erfolgsmass: die Plätze zu füllen. Das Camp ist klein
und läuft ohnehin voll; Reichweite ist kein Ziel.

## Positioning

Das Training wird von aktiven Nationalspieler:innen selbst geleitet — nicht von
einer Camp-Organisation mit angestellten Trainer:innen. Kleine Gruppe (max. 30),
persönliches Feedback, Erfahrung aus Nationalteam und europäischen Topclubs,
direkt in einer Vorortshalle. Der Antrieb ist ausdrücklich „etwas zurückgeben",
nicht ein Geschäftsmodell: privat, nicht-kommerziell, ein Tag im Jahr.

## Operating Context

- **Ein Anlass pro Jahr.** Die Seite lebt in einem Jahreszyklus: Ankündigung →
  Anmeldung offen → Camp → Galerie → lange Ruhephase. Zwischen den Editionen ist
  die Anmeldung geschlossen und die Seite trotzdem die offizielle Adresse.
- **Nichts ist hartcodiert**, was ein Jahr, ein Datum, einen Ort oder einen
  Preis betrifft — alles kommt aus `site_settings` / `content_blocks` und wird
  im Admin gepflegt (`registration_open`, `course_date`, `price_chf`,
  `venue_name`, `current_edition_year` …).
- **Drei Organisator:innen mit gleichen Rechten**, alle keine Entwickler:innen.
  Der deutschsprachige Admin unter `/admin` (Inhalte · Team · Galerie · Zitate &
  Zahlen · Eckdaten · Karussell · Einstellungen · Nachrichten) ist das einzige
  Werkzeug, das sie benutzen.
- **Zwei Foto-Kanäle nebeneinander:** auf der Website eine kuratierte Auswahl von
  ~20–30 Fotos pro Jahr als Eindruck; die vollständigen Sätze (~200 Fotos pro
  Session) gehen separat per OneDrive-Link an die Eltern. Die Website ist
  ausdrücklich kein Download-Dienst.
- **Live seit 18. August 2026** unter `www.improveyourskills.ch`. Änderungen
  treffen echte Besucher:innen.

## Capabilities and Constraints

**Heute vorhanden:** Startseite mit Hero, Eckdaten, Angebot und Eindrücken ·
Über uns (Ansatz, Team, Karussell, Zahlen-Band, Zitate) · Impressionen mit
Jahresfilter und Lightbox · Kontaktformular (Zod, Turnstile, Resend,
Auto-Antwort, Admin-Posteingang) · Anmeldeseite mit Offen/Geschlossen-Zustand ·
Impressum und Datenschutz · Admin mit Magic-Link-Login · drei Sprachen.

**Technische Rahmenbedingungen:**

- Next.js 15 (App Router) / React 19 auf Vercel Hobby, Supabase Free (EU),
  Resend, Cloudflare Turnstile + cookieless Web Analytics.
- **Plain CSS und CSS Modules, kein Tailwind, kein UI-Kit.** Jeder Farb-,
  Schrift-, Radius-, Schatten- und Abstandswert stammt aus
  `src/styles/tokens.css`.
- Freie Kontingente sind gestaltungsrelevant: Supabase Storage 1 GB, DB 500 MB,
  Projekt pausiert nach ~7 Tagen Inaktivität (täglicher Vercel-Cron hält es
  wach). **Keine** Supabase-Bildtransformation und **keine** Vercel Image
  Optimization — Bilder werden beim Upload clientseitig in drei WebP-Grössen
  gerechnet und über einen eigenen Next-Image-Loader ausgeliefert.
- Auth ausschliesslich Supabase Magic Link, keine Passwörter. RLS auf jeder
  Tabelle; Galerie-Bucket privat, Auslieferung nur über `/api/foto/[id]/[size]`
  mit `hidden`-Prüfung.
- Leistungsziele mobil: Lighthouse Performance ≥ 90, A11y ≥ 95, Best Practices
  ≥ 95, SEO ≥ 95; LCP < 2,5 s, CLS < 0,1, INP < 200 ms.
- Sprachen: `de` ist Standard ohne Präfix, `/en` und `/fr` existieren, sind aber
  noch wortgleiche deutsche Kopien; fehlende Schlüssel fallen auf Deutsch
  zurück. EN/FR sind nice-to-have, `fr` bewusst nicht in Sitemap/Hreflang.

**Bewusst offen / noch nicht entschieden:**

- **Echte Online-Anmeldung ist gewollt** (statt „meld dich über das
  Kontaktformular"): Kind, Jahrgang, Verein, Notfallkontakt, Einwilligungen —
  **inklusive Online-Zahlung**, Anmeldung erst mit Zahlung verbindlich. Der
  Zahlungsdienstleister ist noch nicht gewählt; Gebühren und die
  Datenschutz-Folgen (Daten von Minderjährigen, neuer Auftragsverarbeiter) sind
  noch nicht geklärt. Bis dahin bleibt der heutige Weg über das Kontaktformular.
- **Sponsoren- oder Partnerbereich:** als Idee notiert, heute unentschieden.
- **Aus dem Schriftzug soll eine richtige Marke entwickelt werden** — als
  ausdrückliches, noch nicht terminiertes Ziel festgehalten.

## Brand Commitments

- **Name:** „Improve your skills" / improveyourskills.ch. Ansprache in der
  Du-Form, deutsch, warm und direkt, geschlechtergerecht („Nationalspieler:innen",
  „Spieler:innen").
- **Die Marke ändert sich nicht.** Dunkelgrün `#102C26`, Creme `#F7E7CE`, Syne
  als Display-Schrift, DM Sans als Fliesstext, Pill-Badges, gerundete Karten —
  alles aus `src/styles/tokens.css` mit Quellenangabe pro Wert. Keine erfundene
  Farbe, keine erfundene Schrift. Fehlerrot ist bereits definiert
  (`#c94a4a` / `#8b1a1a`).
- **Der Schriftzug ist heute das Logo** (bewusste Entscheidung vom 28.07.2026);
  ein echtes Logo ist ein späteres, ausdrückliches Ziel. Favicon, Apple-Touch-Icon
  und OG-Bild sind aus dieser Wortmarke abgeleitet, nicht neu erfunden.
- **Privates, nicht-kommerzielles Projekt.** Keine Firmen-, Umsatz- oder
  Wachstumssprache, keine Werbeversprechen.

## Evidence on Hand

- **Echt und belegt:** die drei Organisator:innen als aktive Schweizer
  Nationalspieler:innen; Buchholz Sporthalle, 8610 Uster; Preis CHF 48.–;
  Gruppengrösse max. 30 Kinder; Kategorien U14 Männer und U17 Frauen;
  Trainingsfotos in `public/Bilder/` bzw. in der Galerie.
- **Fotorechte geklärt (28.07.2026):** Die Einwilligung wurde bei jeder Anmeldung
  eingeholt; von Kindern ohne Foto-Erlaubnis wurden gar keine Fotos gemacht. Die
  kuratierte Galerie ist damit gedeckt, Impressum und Datenschutz beschreiben das
  korrekt.
- **Existiert nicht — darf nicht behauptet werden:** Zitate von Teilnehmenden
  oder Eltern (`testimonials` ist leer, der Abschnitt bleibt unsichtbar) ·
  Kennzahlen (`stats` ist leer) · Partner-, Sponsoren- oder Verbandslogos ·
  Presseberichte · Auszeichnungen · Teilnehmerzahlen früherer Jahre.
- **Fehlende Bilder sind in `docs/PLATZHALTER.md` einzeln erfasst** (B1–B11,
  T1–T11). Jede Bildstelle im Admin hat einen ehrlichen Platzhalter-Zustand;
  fehlt das Bild, verschwindet die Sektion, statt eine Lücke zu hinterlassen.
  **Kein Stockfoto, keine erfundene Person.**

## Product Principles

1. **Vertrauen vor Reichweite.** Jede Entscheidung wird daran gemessen, ob eine
   Mutter oder ein Vater in zwei Minuten auf dem Handy Sicherheit gewinnt — nicht
   daran, ob sie Klicks bringt.
2. **Nichts behaupten, was es nicht gibt.** Leere Daten führen zu einer
   ausgeblendeten Sektion, nie zu Fülltext, Stockbild oder erfundenem Zitat.
3. **Das Team muss es selbst pflegen können.** Alles, was sich zwischen zwei
   Editionen ändert (Jahr, Datum, Preis, Ort, Anmeldung offen/zu, Fotos, Texte),
   gehört in den deutschsprachigen Admin — nie in den Code.
4. **Die Marke ist Erbe, nicht Spielmaterial.** Verbessern heisst innerhalb der
   bestehenden Tokens und Muster arbeiten.
5. **Kinderdaten und Kinderfotos bekommen die vorsichtigste Variante.** Privater
   Bucket, `hidden`-Flag, keine Rohdaten-URLs, gehashte IPs, kein Tracking mit
   Cookies — auch dann, wenn eine bequemere Lösung existiert.

## Accessibility & Inclusion

- Ziel Lighthouse A11y ≥ 95 (mobil, gedrosselt).
- Bewegung respektiert durchgehend `prefers-reduced-motion`; Animationen dürfen
  Lesbarkeit nie verzögern und nie Layout verschieben. Die erste Ansicht der
  Startseite bleibt sofort lesbar.
- Tap-Ziele ≥ 44 px, mobiles Menü mit `aria-expanded`, Fokusfalle und Esc.
- Kein horizontales Scrollen zwischen 320 und 1920 px.
- Deutsch ist die verbindliche Sprache; EN/FR fallen auf Deutsch zurück statt auf
  Leerstellen.
