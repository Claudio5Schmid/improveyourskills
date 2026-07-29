# Checkpoint — Phase 1 (Umzug auf Next.js)

**Stand:** 29. Juli 2026 · **Branch:** `feat/relaunch` · 14 Commits

## Was fertig ist

- **Next.js 15 + TypeScript** (App Router), ESLint + Prettier, Build/Lint/Typecheck sauber.
- **Alle 6 Seiten portiert** und im Browser geprüft: `/`, `/ueber-uns`, `/impressionen`,
  `/kontakt`, `/anmeldung`, `/impressum`. Optisch deckungsgleich mit der Live-Seite.
- **Schriften selbst gehostet** (Syne + DM Sans über `next/font`) — keine Google-Verbindung
  mehr. Fehlende Schnitte DM Sans 600/700 ergänzt, ungenutztes Kursiv entfernt.
- **Design-Tokens** sind einzige Quelle: `globals.css` + CSS-Module je Seite, alle Werte
  aus `tokens.css`. Keine neue Farbe/Schrift/Radius.
- **next-intl** (DE Standard ohne Präfix, `/en`, `/fr`; fehlende Übersetzungen fallen auf
  Deutsch zurück). Dezenter Sprachumschalter in der Navigation.
- **Navigation & Footer** als je eine Komponente (vorher 6× kopiert). Mobiles Menü jetzt
  barrierefrei: `aria-expanded`, Fokus-Falle, `Esc`, Scroll-Sperre.
- **301-Weiterleitungen** von allen alten `.html`-URLs → neue saubere URLs.
- **Responsive** an 320/375/768/1280/1440 + Querformat geprüft: kein horizontaler Scroll,
  nichts abgeschnitten. **Tap-Ziele ≥ 44 px** (unsichtbar vergrössert, Optik unverändert).
- **Google Maps** auf `/kontakt` lädt erst nach Klick (Datenschutz).
- **Favicon**-Platzhalter im Browser-Tab; tote `logo.png`-Verweise entfernt.
- **Netlify-Konfiguration** (`netlify.toml`, `.nvmrc`) und DNS-Vorbereitung
  (`docs/DNS-HOSTPOINT.md`) liegen bereit.

## Bewusste Abweichung (brauche kein OK, nur zur Info)

- Das portierte CSS ist **„Desktop-first"** (wie das Original), nicht auf „Mobile-first"
  umgeschrieben. Grund: das Ergebnis ist an jeder Breite identisch, ein Umschreiben würde
  nur die Schreibweise ändern und das Risiko optischer Abweichungen erhöhen. Neues CSS ab
  Phase 2 schreibe ich mobile-first. Wenn du den Umbau trotzdem willst, mache ich ihn.

## Was du tun musst, bevor es weitergeht

1. **Netlify-Konto** anlegen (falls noch nicht vorhanden).
2. Mir Bescheid geben — dann **pushe ich den Branch** `feat/relaunch` auf GitHub und
   führe dich durch das Verbinden mit Netlify (Preview-Deploy, **ohne** DNS-Umstellung).
3. Die alte Seite bleibt die ganze Zeit unverändert online.

## Bekannte, bewusst so belassene Punkte (Phase-übergreifend)

- **Impressum** ist wie im Original ungestylt — bekommt in Phase 7 eine richtige Gestaltung.
- **Jahr/Preis/Datum** stehen noch als Text im Code (z. B. „Skill Training 2026",
  „CHF 48.–") — wandern in Phase 2 in die Datenbank (`site_settings`).
- **Bilder** sind noch die grossen Originale — die Optimierung (WebP, mehrere Grössen)
  kommt in Phase 7. Deshalb lädt die Seite lokal noch langsam; das ist erwartet.
- Offene **Platzhalter** (Hero-Bilder, CTA-/Header-Bilder usw.): `docs/PLATZHALTER.md`.

## Nächster Schritt

Nach deinem OK und dem Netlify-Setup: **Phase 2 — Supabase** (Datenmodell, Sicherheit,
Inhalte editierbar machen). Details in `docs/PLAN.md`.
