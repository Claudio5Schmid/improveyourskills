# PLAN — Umsetzung Phasen 1–7

**Stand:** 28. Juli 2026 · **Branch:** `feat/relaunch` · **Basis:** `docs/AUDIT.md`

Dieses Dokument beschreibt, wie ich vorgehe, was du jeweils selbst tun musst und wo ich
Risiken sehe. Es ist ein Plan, kein Vertrag — nach jeder Phase halten wir an und du
entscheidest, ob es so weitergeht.

---

## Grundsatz

**Die alte Website bleibt unangetastet online, bis du Parität bestätigt hast.**
Alles Neue entsteht auf `feat/relaunch` und wird als Vercel-Preview deployt. Die
Hostpoint-DNS wird erst in Phase 7 umgestellt — mit dokumentiertem Rückweg.

Drei Regeln, an die ich mich durchgehend halte:

1. Keine neue Farbe, keine neue Schrift, kein neuer Radius. Alles kommt aus `tokens.css`.
2. Kein Geheimnis im Repository. `.env*` ist ab Phase 1 in `.gitignore`.
3. Keine selbstgebaute Anmeldung. Ausschliesslich Supabase Auth.

---

## Phase 1 — Umzug auf Next.js, optisch identisch

**Ziel:** dieselbe Website, nicht unterscheidbar, auf Next.js, als Vercel-Preview.
Keine neuen Funktionen.

### Vorgehen

Ich mache das **in zwei getrennten Schritten**, und zwar bewusst:

**Schritt 1a — wörtliche Portierung.**
Next.js (App Router, TypeScript) aufsetzen, die sechs Seiten zu Routen machen, das CSS
**unverändert** übernehmen (gleiche Regeln, gleiche `max-width`-Breakpoints, gleiche
Reihenfolge) — nur die Werte durch `tokens.css` ersetzt. Navigation, Footer und die
Skripte werden zu je einer Komponente statt sechsmal kopiert. Danach vergleiche ich
Screenshots alt/neu bei 320, 375, 390, 768, 1024, 1280, 1440 und 1920 px.
**Erst wenn das deckungsgleich ist, geht es weiter.**

**Schritt 1b — Umbau auf Mobile-First.**
Das heutige CSS ist „Desktop zuerst" (nur `max-width`-Abfragen). Das Briefing wünscht
Mobile-First. Das ist eine gute Idee, aber es ist **genau der Schritt, bei dem sich
optische Abweichungen einschleichen**. Deshalb passiert er separat und mit denselben acht
Screenshot-Vergleichen als Prüfstein. Weicht eine Breite ab, nehme ich das Stück zurück.

> **Warum getrennt:** Wenn ich beides gleichzeitig mache und bei 768 px etwas verrutscht,
> weiss niemand, ob es am Framework oder am CSS-Umbau lag. Getrennt ist es in Minuten
> gefunden. Das ist der einzige Grund — Aufwand ist praktisch gleich.

### Weitere Inhalte der Phase

- **Saubere URLs** `/`, `/ueber-uns`, `/impressionen`, `/kontakt`, `/anmeldung`,
  plus `/impressum` (existiert, siehe Audit §2.6).
- **301-Weiterleitungen** von allen alten `.html`-URLs in `next.config.ts`.
  Zusätzlich zu den im Briefing genannten auch `/impressum.html`.
- **Schriften selbst hosten** (Audit §4) — **braucht dein OK**.
- **next-intl** mit `de` als Standard ohne Präfix, `/en/…` und `/fr/…`.
  Fehlende Übersetzungen fallen auf Deutsch zurück, nie auf einen leeren String.
- **Sprachumschalter** in der Navigation, in bestehender Nav-Optik.
- **Mobiles Menü zugänglich machen** — es existiert bereits (Audit §6, Punkt 2), es fehlen
  nur `aria-expanded`, Fokus-Falle, `Esc` und Scroll-Sperre. Optisch ändert sich nichts.
- **Tap-Targets ≥ 44 px** prüfen und wo nötig anheben.
- **`.DS_Store` und `.gitignore`** aufräumen.

### Was du manuell tun musst

1. Vercel-Konto anlegen (falls nicht vorhanden) und das GitHub-Repository verbinden.
2. Mir bestätigen: Schriften selbst hosten? (Audit §7, Frage 1)
3. Logo liefern oder entscheiden, dass der Schriftzug das Logo ist. (Audit §7, Frage 2)

### Risiko

| Risiko                                          | Einschätzung | Umgang                                                                 |
| ----------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| Optische Abweichung beim CSS-Umbau              | **mittel**   | Zweischritt-Vorgehen oben, Screenshot-Vergleich als Gate               |
| `-webkit-text-stroke` bei „your" rendert anders | gering       | In allen Ziel-Browsern identisch; wird explizit auf Safari/iOS geprüft |
| Next.js auf Vercel                             | gering       | Vercel ist der native Hoster für Next.js — Standardfall                |

---

## Phase 2 — Supabase: Datenmodell, Sicherheit, Inhalte

**Ziel:** alle Texte, Bilder, Termine und Preise kommen aus der Datenbank statt aus dem Code.

### Vorgehen

- Supabase-Projekt anlegen, **Region prüfen**: Supabase bietet neben Frankfurt auch
  **Zürich**. Für ein Schweizer Projekt mit Daten von Minderjährigen ist Zürich klar
  besser. Ich prüfe bei der Erstellung, ob Zürich im Free-Tier verfügbar ist — sonst
  Frankfurt (beides EU/CH-Datenschutzniveau, beides unproblematisch).
- Supabase CLI im Repo, **jede Schemaänderung als versionierte SQL-Migration**.
  Nie im Dashboard klicken.
- Tabellen wie im Briefing: `content_blocks`, `team_members`, `carousel_images`,
  `testimonials`, `stats`, `gallery_photos`, `contact_messages`, `site_settings`, `admins`.
- **`src/content/registry.ts`** — die typisierte Liste aller bearbeitbaren Felder
  (Schlüssel, Art, deutsches Label, Hilfetext, Zeichenlimit, Seite/Abschnitt).
  Das Admin-Formular wird daraus **generiert**. Ein neues Feld später = ein Eintrag hier.
- **Seed aus dem Ist-Zustand:** die Texte aus `docs/AUDIT.md §2` wandern wörtlich in die
  Datenbank. Nichts geht verloren, nichts wird umformuliert.
- **RLS auf jeder Tabelle**, plus `docs/RLS.md` mit Erklärung auf Deutsch und SQL-Tests,
  die beweisen, dass anonym: keine Nachrichten lesbar, keine versteckten Fotos lesbar,
  nichts schreibbar.
- **Jahres- und Datumsneutralität:** kein Jahr, kein Datum, kein Preis mehr im Code.
  Alles aus `site_settings`. Der offene Anmelde-Zustand wird aus der Git-Historie
  rekonstruiert (Audit §2.5) — das CSS dafür ist noch vollständig da.
- **Caching:** `revalidate = 300` plus gezielte Invalidierung beim Speichern im Admin.

### Was du manuell tun musst

1. Supabase-Konto anlegen, Projekt erstellen, mir Projekt-URL und Keys geben
   (die kommen **nur** in die Vercel-Umgebungsvariablen, nie ins Repository).
2. Entscheiden: Hero-Slider mit drei Bildern beibehalten oder auf ein Bild reduzieren?
   Das Briefing nennt in §2.2 nur „hero background image" (Einzahl), tatsächlich sind es
   drei rotierende Bilder. Ich würde alle drei bearbeitbar machen.

### Risiko

| Risiko                                    | Einschätzung             | Umgang                                                                               |
| ----------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| RLS falsch konfiguriert → Datenleck       | **hoch, wenn unbemerkt** | Automatisierte SQL-Tests als Teil der Migration, Ergebnis im Checkpoint              |
| Free-Tier-Pause nach 7 Tagen              | sicher eintretend        | Täglicher Vercel Cron Job (Phase 7), bis dahin unkritisch                           |
| Registry und Datenbank laufen auseinander | mittel                   | Registry ist die Quelle; ein Skript prüft beim Build, dass jeder Schlüssel existiert |

---

## Phase 3 — Admin unter `/admin`

**Ziel:** ihr vier könnt Inhalte ändern, ohne Code anzufassen.

- **Nur Magic Link**, kein Passwortfeld. Öffentliche Registrierung im Supabase-Dashboard
  abgeschaltet — ich dokumentiere Klick für Klick auf Deutsch, wo das ist.
- **Middleware** schützt jede `/admin`-Route und jede Admin-API serverseitig.
- **Optik:** gleiche Marke, dichter und nüchterner als die öffentliche Seite.
- **Seitenleiste:** Inhalte · Team · Galerie · Zitate & Zahlen · Anmeldung & Einstellungen · Nachrichten.
- **Textfelder** mit DE/EN/FR-Reitern, DE Pflicht, Hinweis „fällt auf Deutsch zurück".
- **Bildfelder** mit Drag-and-drop, Vorschau, Alt-Text pro Sprache, klarem
  „Platzhalter — noch kein Bild"-Zustand und einem Banner auf der Startseite des Admins,
  das alle offenen Platzhalter auflistet.
- **Löschen immer mit Rückfrage, die den Namen des Objekts nennt.**
- `noindex, nofollow` + Ausschluss in `robots.txt`.

### Was du manuell tun musst

1. Im Supabase-Dashboard die drei bis vier Personen einladen (ich führe dich durch).
2. Entscheiden, wer die vierte Person ist — das Briefing nennt vier Konten, aber drei
   Organisator:innen.

### Risiko

| Risiko                         | Einschätzung | Umgang                                                                                                 |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| Magic-Link-Mail landet im Spam | **mittel**   | Supabase-Standardversand ist begrenzt; ggf. Resend als SMTP hinterlegen (Phase 5 ohnehin eingerichtet) |
| Jemand sperrt sich aus         | gering       | Zugang lässt sich im Supabase-Dashboard jederzeit neu erteilen; steht in `BETRIEB.md`                  |

---

## Phase 4 — Galerie

**Ziel:** Fotos auf der eigenen Website statt hinter einem OneDrive-Link.

- Nach **Jahr** gefiltert, Standard = neuestes Jahr, Filter in der URL (`?jahr=2026`).
- Masonry-artiges Raster, Lightbox mit Tastatur, Wischen, Vorausladen.
- **Upload komplett im Browser:** EXIF-Jahr auslesen (`exifr`), nach EXIF drehen,
  **alle Metadaten inkl. GPS entfernen**, drei WebP-Grössen erzeugen (480/1200/2000 px),
  Blur-Platzhalter, parallel hochladen mit Fortschritt und Wiederholung.
- Speicherpfad `gallery/{jahr}/{uuid}_{grösse}.webp`.
- Verbergen pro Foto als Rücknahme-Mechanismus; Löschen entfernt **alle drei Dateien**.

### Ein technischer Punkt, der dir wichtig sein wird

Das Briefing verlangt zwei Dinge, die sich gegenseitig bedingen:

- Bilder dürfen **nicht** in der Google-Bildersuche auftauchen
  (`X-Robots-Tag: noindex, noimageindex`), und
- es darf **nie** eine direkte Supabase-URL im HTML stehen.

Daraus folgt: die Bilder müssen **durch unsere eigene Route laufen**
(`/api/foto/[id]/[size]`), nicht per Weiterleitung auf eine signierte Supabase-URL.
Bei einer Weiterleitung kämen die Bytes von Supabase — **mit Supabase-Headern, also ohne
unser `noindex`**. Der Schutz wäre wirkungslos.

Der Preis dafür: jeder Bildabruf, der nicht aus dem Cache kommt, ist ein Funktionsaufruf
bei Vercel. Ich fange das mit langen `Cache-Control`-Zeiten und unveränderlichen
Dateinamen ab, sodass Vercels Edge-Cache die allermeisten Abrufe beantwortet und die
Funktion pro Bild nur selten läuft. Realistisch ist das für eure Besucherzahlen
unproblematisch — ich beobachte es aber und schreibe die Zahlen in `BETRIEB.md`.

### Was du manuell tun musst

Einen Testordner mit ~30 Fotos gemischter Ausrichtung bereitstellen (Checkpoint-Vorgabe).

### Risiko

| Risiko                                              | Einschätzung      | Umgang                                                                |
| --------------------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| Speicherplatz 1 GB                                  | gering            | 200 Fotos × 3 Grössen ≈ 120–150 MB pro Jahrgang → reicht für ~6 Jahre |
| Kompression im Browser auf schwachem Laptop langsam | mittel            | Parallelität begrenzen, Fortschritt anzeigen; Messwerte im Checkpoint |
| Fotos ohne EXIF                                     | sicher eintretend | Kaskade EXIF → Dateidatum → aktuelles Jahr, immer überschreibbar      |
| **Einwilligungen decken Veröffentlichung nicht**    | **offen**         | Audit §7 Frage 6 — muss vor dem Livegang geklärt sein                 |

---

## Phase 5 — Kontaktformular

Ersetzt den `mailto:`-Link. Felder: Vorname, Name, E-Mail, Nachricht, Einwilligung.

- Serverseitige Prüfung mit Zod, Turnstile serverseitig verifiziert, Honeypot,
  Rate-Limit pro IP (IP nur als gesalzener Hash gespeichert).
- **Nachricht wird immer gespeichert, auch wenn der Mailversand scheitert** — die
  Besucherin sieht Erfolg, der Fehler landet im Admin.
- Mail an `pascal.schmuki@bluewin.ch` mit `Reply-To` der Absenderin.
- Automatische Empfangsbestätigung in der Sprache der Besucherin.
- Posteingang im Admin, ungelesen fett, Zähler in der Seitenleiste.

### Was du manuell tun musst

1. Resend-Konto anlegen.
2. **DNS-Einträge bei Hostpoint setzen** (SPF, DKIM, DMARC) — ich liefere die exakten
   Werte und eine Anleitung auf Deutsch. Bis die Domain verifiziert ist, funktioniert nur
   eine Test-Absenderadresse.
3. Cloudflare-Turnstile-Schlüsselpaar erzeugen.
4. Entscheiden: Google Maps wie bisher, oder erst nach Klick laden? (Audit §7, Frage 4)

---

## Phase 6 — Über uns aufwerten

Nur aus vorhandenen Bausteinen — keine neue Designsprache.

- **Zahlenband** (`stats`) in Syne, mit Hochzählen beim Sichtbarwerden.
- **Zitate** (`testimonials`) in der bestehenden Kartenoptik.
- **Bessere Trainerkarten** — grössere Fotos, dezenter Hover, Nationalteam-Zeile stärker.
- **Mehr Bilder** an sinnvollen Stellen, jedes als Admin-Feld mit Platzhalter-Zustand.
- **Bewegung**, aber: nichts verzögert Lesbarkeit, kein Layout-Sprung, alles aus bei
  `prefers-reduced-motion`.

> **Ein Konflikt, den ich dir vorlegen muss:** Das Briefing sagt „keine Animation im
> ersten Viewport der Startseite". Genau dort läuft heute die gestaffelte
> Einblendung (`.animate-up`, Audit §6 Punkt 7) — sie prägt den ersten Eindruck stark.
> Mein Vorschlag: behalten, aber so umbauen, dass der Text **sofort sichtbar** ist und
> sich nur leicht bewegt (kein Start bei `opacity: 0`). Damit bleibt der Charakter und
> die Ladewahrnehmung wird trotzdem besser. Audit §7, Frage 3.

---

## Phase 7 — Performance, SEO, Recht, Livegang

### Performance — hier liegt der grösste Gewinn

Ausgangslage laut Audit §3.2: Startseite **37 MB**. Ziel: **unter 400 KB Bild-Last**.

- Alle Bilder als WebP in mehreren Grössen, `srcset` + `sizes`, eigener Next.js-Loader
  (bewusst **nicht** Vercels Image Optimization, damit kein Kontingent verbraucht wird).
- Feste `width`/`height` überall → **CLS 0**.
- Hero-Bild vorgeladen, alles andere lazy mit Blur-Platzhalter.
- **Wichtig zum Hero:** heute werden alle drei Slider-Bilder sofort geladen (26,7 MB).
  Neu wird nur das erste vorgeladen, die anderen erst kurz vor dem Wechsel.
- Alte übergrosse Bilder aus dem Repository entfernen — **erst nach deiner Freigabe**
  (Audit §7, Frage 5).

**Zielwerte** (mobil, gedrosselt): Performance ≥ 90, Accessibility ≥ 95,
Best Practices ≥ 95, SEO ≥ 95; LCP < 2,5 s, CLS < 0,1, INP < 200 ms.
**Ich melde die gemessenen Zahlen, auch wenn sie das Ziel verfehlen.**

### SEO

Titel und Beschreibungen pro Seite und Sprache aus der Datenbank, Open Graph,
`hreflang`, Canonicals, dynamische `sitemap.xml`, `robots.txt`, JSON-LD, Favicons.

### Recht (revDSG)

`/impressum` überarbeiten und `/datenschutz` neu, beide dreisprachig, als **Entwurf
gekennzeichnet**. Verlinkt im Footer — heute ist das Impressum von nirgends erreichbar
(Audit §5.6). **Ich bin keine Rechtsberatung**; du musst das prüfen und ergänzen.

Besonders wichtig: der heutige Fotorechte-Absatz verspricht das Gegenteil dessen, was die
Galerie tut. Das muss vor dem Livegang geklärt sein.

**Kein Cookie-Banner** — Begründung: nur technisch notwendige Cookies (Supabase-Session,
nur für eingeloggte Admins), Cloudflare Web Analytics ist cookielos. Diese Begründung
trägt aber **nur, wenn Google Fonts und Google Maps verschwinden bzw. erst nach Klick
laden** (Audit §4 und §5.7). Ich schreibe die Begründung so auf, dass du sie belegen kannst.

### Livegang

Vercel-Umgebungsvariablen, Security-Header inkl. einer CSP, die mit Supabase, Turnstile
und Cloudflare **getestet** ist — die Header bleiben in `next.config.ts` (hoster-
unabhängig), nicht in einer `vercel.json`. Dann eine nummerierte Hostpoint-Anleitung auf
Deutsch inklusive Rückweg. Der Supabase-Keep-alive läuft als **täglicher Vercel Cron Job**
(Hobby-Plan erlaubt Crons nur einmal pro Tag — für die 7-Tage-Pause reicht das locker).

**Zur DNS-Entscheidung schon jetzt:** die `CNAME`-Datei sagt `www.improveyourskills.ch`.
Die Website läuft also auf **www**. Ich empfehle, das beizubehalten (`www` als Hauptadresse,
nackte Domain leitet weiter) — das ist bei Hostpoint der unkompliziertere Weg und
vermeidet Probleme mit Apex-Einträgen. Details in Phase 7.

---

## Wichtigste Risiken über alle Phasen

| #   | Risiko                                                             | Auswirkung      | Umgang                                                        |
| --- | ------------------------------------------------------------------ | --------------- | ------------------------------------------------------------- |
| 1   | **RLS-Fehler legt Kontaktnachrichten oder versteckte Fotos offen** | hoch            | Automatisierte Negativ-Tests, Ergebnis im Checkpoint Phase 2  |
| 2   | **Fotorechte-Zusage widerspricht der Galerie**                     | hoch, rechtlich | Vor Phase 4 klären (Audit §7 Frage 6)                         |
| 3   | **Optische Abweichung beim CSS-Umbau**                             | mittel          | Zweischritt-Vorgehen Phase 1, Screenshot-Gate                 |
| 4   | Supabase-Projekt pausiert nach 7 Tagen                             | mittel          | Wöchentliche Keep-alive-Funktion, in `BETRIEB.md` beschrieben |
| 5   | Vercel-Funktionsaufrufe durch Bildauslieferung                    | mittel          | Aggressives CDN-Caching, Monitoring                           |
| 6   | Magic-Link-Mails im Spam                                           | mittel          | Resend als SMTP hinterlegen                                   |
| 7   | Dreisprachigkeit erhöht Aufwand in jeder Phase                     | mittel          | Audit §7 Frage 8 — ist EN/FR wirklich gewollt?                |
| 8   | Free-Tier-Grenzen bei Erfolg                                       | gering          | Grenzwerte und Upgrade-Pfad in `BETRIEB.md`                   |

---

## Abhängigkeiten, für die ich dein OK brauche

Im Briefing bereits genannt und damit abgedeckt: `next-intl`, `@supabase/supabase-js`,
`exifr`, `browser-image-compression`, `zod`, `resend`, Playwright.

**Nicht genannt — bitte freigeben:**

| Paket               | Wofür                                                                 | Warum nicht selbst bauen                                                                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`@dnd-kit/core`** | Drag-Sortierung im Admin (Team, Karussell, Galerie, Zitate)           | Selbstgebautes Drag-and-drop funktioniert auf Touch-Geräten und mit Tastatur erfahrungsgemäss schlecht. `@dnd-kit` ist klein, hat Tastaturunterstützung und läuft nur im Admin — es landet nicht im öffentlichen Bundle. |
| **`vitest`**        | Unit-Tests (EXIF-Jahr, Kompression, Formularprüfung, Sprach-Fallback) | Das Briefing verlangt Unit-Tests; ein Test-Runner wird gebraucht. Vitest ist der Standard neben Next.js und nur eine Entwicklungsabhängigkeit.                                                                           |

Beide sind reine Werkzeuge, keine UI-Bibliotheken — die Regel „kein Tailwind, kein
UI-Kit" bleibt unberührt. Wenn du eines davon nicht willst, sag es; ich löse es dann von
Hand und sage dir, was dadurch schlechter wird.

---

## Reihenfolge und Abhängigkeiten

```
Phase 1  Next.js + Optik                    ← kann sofort starten
   │
   ├─→ Phase 2  Supabase + Inhalte          ← braucht Phase 1
   │      │
   │      ├─→ Phase 3  Admin                ← braucht Phase 2
   │      │      │
   │      │      ├─→ Phase 4  Galerie       ← braucht Phase 3 (Upload läuft im Admin)
   │      │      └─→ Phase 5  Kontakt       ← braucht Phase 3 (Posteingang)
   │      │
   │      └─→ Phase 6  Über uns             ← braucht Phase 2, unabhängig von 4/5
   │
   └─→ Phase 7  Performance/SEO/Recht/Live  ← braucht alle
```

Phase 4, 5 und 6 sind untereinander unabhängig — falls du eine davon vorziehen willst,
geht das. Phase 7 kommt zwingend zuletzt, weil erst dann alles messbar ist.

---

## Was ich als Nächstes tue

**Nichts** — bis du Phase 0 freigibst.

Zum Starten von Phase 1 brauche ich von dir mindestens:

- **Frage 1** (Schriften selbst hosten) — blockiert Phase 1
- **Frage 2** (Logo) — blockiert nicht, aber je früher desto besser

Die übrigen Fragen aus `docs/AUDIT.md §7` kann ich später einsammeln.
