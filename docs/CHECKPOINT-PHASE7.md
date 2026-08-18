# Checkpoint — Phase 7 (Performance, SEO, Recht, Livegang)

**Stand:** 18. August 2026 · **Branch:** `feat/relaunch` · **Live:** `www.improveyourskills.ch`

Das ist die letzte Phase aus `docs/PLAN.md` — die Seite ist seit heute **live**.

## Was fertig ist

### Recht (bf43a54)
- **Echtes Impressum** mit dem von dir gelieferten Text (c/o Claudio Schmid,
  info@improveyourskills.ch, „weitere Kontaktangaben auf Anfrage", privates,
  nicht-kommerzielles Projekt aller drei). Löst alle alten Unstimmigkeiten
  (Payrexx, falsches Datum, Adress-Tippfehler) durch Vereinfachung statt
  Korrektur — der starre Adress-/Datumsblock ist ganz weg, die Fusszeile
  zeigt Adresse/Termin ohnehin schon live aus den Einstellungen.
- **Vollständige Datenschutzerklärung** statt des Phase-5-Provisoriums: echtes
  Cookie-Verzeichnis (gegen den tatsächlichen Code geprüft, nicht geraten —
  `NEXT_LOCALE`, Admin-Session, Turnstile, sonst nichts), Auftragsverarbeiter
  (Supabase/Vercel/Resend/Cloudflare), ehrliche Aufbewahrung (manuelle
  Löschung, kein automatisches Ablaufdatum), Betroffenenrechte.
- Fotorechte-Absatz an die Realität angepasst (Einwilligung bei Anmeldung,
  kuratierte Galerie, OneDrive an Eltern) statt des alten „wird nicht
  veröffentlicht"-Versprechens.
- Beide Seiten erstmals richtig gestaltet (`Legal.module.css`) statt
  unformatiertem Browser-Text, nicht mehr `noindex`. `docs/COOKIES.md` hält
  die Begründung fest, warum es bewusst **kein** Cookie-Banner gibt.

### SEO-Grundgerüst (9371b74)
- Pro Seite editierbarer Titel + Beschreibung im Admin (gleiches
  Registry/DB-Muster wie jeder andere Inhalt), zentral zusammengebaut in
  `src/lib/seo.ts` — Canonical, Hreflang, Open Graph, Twitter-Karte für alle
  7 öffentlichen Seiten aus einer Stelle.
- `sitemap.ts` + `robots.ts` neu. Favicon endlich verdrahtet (vorher zeigte
  der Browser-Tab nichts an). Apple-Touch-Icon + Standard-OG-Bild
  automatisch generiert, aus der echten Wortmarke, keine neue Grafik
  erfunden.
- JSON-LD auf der Startseite: Organisation immer, Termin/Ort-Eintrag erst,
  sobald echte Werte in den Einstellungen stehen.
- **Bewusst ausgeklammert:** `fr` fehlt in Sitemap/Hreflang, weil es
  weiterhin eine wortgleiche deutsche Kopie ist — sobald echtes Französisch
  existiert, ist `INDEXABLE_LOCALES` in `src/lib/seo.ts` die eine Stelle zum
  Anpassen.

### Sicherheits-Header inkl. CSP (ede7ce1)
- HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy statisch
  in `next.config.ts`. Die Content-Security-Policy selbst sitzt bewusst in
  `src/middleware.ts` (braucht pro Aufruf ein neues Zufalls-Token, das eine
  statische Konfigurationsdatei nicht liefern kann) — mit echtem Nonce +
  `strict-dynamic` statt der schwächeren `unsafe-inline`-Abkürzung.
- Ende-zu-Ende in einem echten Browser geprüft: Startseite-Hydration,
  Hero-Slider, Sprachumschalter, Kontaktformular-Animation, Turnstile-Widget,
  Google Maps beim Klick, Supabase-Bilder, Admin-Login — überall null
  CSP-Verstösse in der Konsole.

### Performance (f8c9c9a, 8c4abe3, 6750b6f, 6c3c0f8)
- **Responsive Bildgrössen überall**, nicht nur in der Galerie: Hero-Slider,
  Seitenköpfe, „Was wir anbieten"-Kacheln, Eindrücke-Reihe, Teamfotos,
  Über-uns-Karussell/Banner. Gleiches 3-Grössen-Schema wie die Galerie
  (480/1200/2000 px WebP).
- Mehrere übergrosse Original-Fotos gefunden und komprimiert, ohne Dateiname
  oder Pfad zu ändern (das hätte die live in der Datenbank gespeicherten
  Bildpfade gebrochen — bereits einmal in-phase erlebt).
- **Der eigentliche Performance-Fund:** Seiten mit fast keiner Bildlast
  (z. B. `/kontakt`) fühlten sich trotzdem ~10 Sekunden langsam an. Ursache
  war nicht die Bildgrösse, sondern dass Inhalte serverseitig unsichtbar
  gerendert wurden (`opacity: 0`) und erst nach vollständiger
  JavaScript-Hydration eingeblendet wurden — das sieht exakt aus wie „die
  Seite lädt noch". Behoben: Inhalt ist von Anfang an sichtbar, nur was noch
  unterhalb des sichtbaren Bereichs liegt, wird nachträglich „scharf
  geschaltet". Zusätzlich: beide Bilder-Slider luden vorher alle Folien
  gleichzeitig; jetzt wird immer nur die aktuelle plus die nächste geladen.
  Gemessen: `/ueber-uns` 975 KB → 201 KB Bildlast.

### Supabase-Wachhalter (dac9203)
- Täglicher Vercel-Cron (`/api/cron/keep-alive`, 04:00 UTC) liest einen
  einzelnen Wert aus der Datenbank, damit das kostenlose Supabase-Projekt
  nicht nach ~7 Tagen Inaktivität pausiert. Verweigert ohne gesetztes
  `CRON_SECRET` bewusst den Dienst (503), statt offen erreichbar zu sein.

### Cloudflare Web Analytics (41f2198)
- Cookielose Besucherstatistik, nur auf den öffentlichen Seiten (nie im
  Admin), nur im echten Produktions-Build aktiv — lokales Testen erzeugt
  keine falschen Zahlen.

### Livegang (18. August 2026)
- **DNS bei Hostpoint auf Vercel umgestellt** — von dir durchgeführt.
  `www.improveyourskills.ch` und die nackte Domain zeigen jetzt auf die neue
  Seite, HTTPS-Zertifikat aktiv, alte `.html`-Adressen leiten weiterhin
  korrekt weiter (301). Die alte Seite auf `main`/GitHub Pages bleibt
  unangetastet als Rückweg.
- **Beide offenen Vercel-Variablen gesetzt:** `CRON_SECRET` (Wachhalter
  läuft) und `NEXT_PUBLIC_SITE_URL=https://www.improveyourskills.ch` (nach
  dem Livegang live geprüft: Canonical-Link, Open-Graph-URL/-Bild, Sitemap
  und robots.txt zeigen jetzt korrekt auf die echte Domain statt auf eine
  interne Vorschau-Adresse).

## Ein Fund unterwegs (behoben)

Direkt nach dem Livegang fiel beim Live-Check auf, dass Canonical-Link,
Open-Graph-Vorschau, Sitemap und robots.txt auf eine interne, bei jedem
Deploy wechselnde Vercel-Vorschauadresse zeigten statt auf die echte Domain —
weil `NEXT_PUBLIC_SITE_URL` noch fehlte. Genau das Risiko, vor dem in
`docs/VERCEL.md` gewarnt wurde: kein Fehler, keine kaputte Seite, nur
stillschweigend falsche Metadaten genau dann, wenn Suchmaschinen und
Social-Media-Vorschauen sie zum ersten Mal sehen. Nach dem Setzen der
Variable und einem erneuten Deploy live nachgeprüft — jetzt überall korrekt.

## Bewusste Annahmen

- **`style-src` behält `unsafe-inline`** in der CSP (dokumentierter
  Kompromiss: der Code nutzt überall `style={{...}}`, dafür gibt es keinen
  praktikablen Pro-Request-Nonce-Mechanismus).
- **Kein Cookie-Banner** — Begründung in `docs/COOKIES.md`: alle verwendeten
  Cookies sind technisch notwendig oder cookielos (Cloudflare Analytics
  arbeitet ohne Cookies).
- **`fr` bleibt aus Sitemap/Hreflang ausgeschlossen**, bis echte
  französische Übersetzungen existieren.

## Was ich nicht selbst verifizieren konnte

Ein echter Admin-Bild-Upload über die neue Mehrgrössen-Pipeline und der
tatsächliche Magic-Link-Login im Browser — wie bei jeder Admin-Funktion
bisher fehlt mir dafür ein eigener Zugang. Der Mechanismus dahinter ist aber
exakt derselbe, der seit Phase 3 nachweislich funktioniert.

## Nächster Schritt

**Die Seite ist live.** Laut `docs/PLAN.md` war Phase 7 die letzte Phase.
Offen, aber nicht dringend:

- Aufräumen der verbleibenden Originalbilder in `public/Bilder/` (kosmetisch,
  die grössten Ausreisser sind bereits behoben).
- Die Resend-DNS-Frage aus einer früheren Session — noch nicht abschliessend
  geklärt, ob die Kontaktformular-Mails tatsächlich zugestellt werden.
- Zwei ältere, separat vorgemerkte Kleinigkeiten auf der Anmeldung-Seite
  (Mobil-Umbruch, Kopftext berücksichtigt offen/geschlossen-Zustand nicht).

Als Nächstes: die von dir angekündigten weiteren Sicherheitschecks und
Audits.
