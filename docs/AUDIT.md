# AUDIT — Bestandsaufnahme improveyourskills.ch

**Stand:** 28. Juli 2026 · **Analysierter Commit:** `7dd05a6` (= aktueller Live-Stand)
**Zweck:** Vollständige Inventur der bestehenden Website, bevor irgendetwas umgebaut wird.

---

## 0. Wichtigste Erkenntnisse vorab

| # | Erkenntnis | Bedeutung |
|---|---|---|
| 1 | **Dein lokaler Ordner war 29 Commits veraltet.** | Details unten in §1 — bitte lies das zuerst. |
| 2 | **Die Startseite lädt 37 MB Bilder.** | Das ist die Ursache für „Bilder laden langsam". Details in §3. |
| 3 | **Die Schriften kommen von Google Fonts, nicht aus dem CSS.** | Deine Annahme im Briefing war anders. Details in §4. |
| 4 | **3 Bilder werden im HTML referenziert, existieren aber nicht** — u. a. das Logo. | Die Website zeigt aktuell auf **jeder** Seite den Text-Ersatz statt eines Logos. Details in §3.3. |
| 5 | **`impressum.html` ist verwaist** — keine einzige Seite verlinkt darauf. | Rechtlich relevant. Details in §5.6. |
| 6 | **Drei verschiedene Footer** auf sechs Seiten, zwei davon mit dem alten Datum „So, 5. Juli 2026". | Besucher sehen widersprüchliche Angaben. Details in §5.1. |
| 7 | Die Website hat **keine Datenschutzerklärung**. | Ab Kontaktformular + Login + Fotos zwingend. Phase 7. |

---

## 1. ⚠️ Repository-Stand — bitte lesen

Als ich angefangen habe, war der Ordner auf deinem Rechner **29 Commits hinter GitHub**.
Der lokale Stand (`d3e1ce7`) hatte:

- **keine** `impressionen.html`
- eine dreiteilige Navigation ohne „Impressionen"
- noch die Session-Aufteilung Morgen/Nachmittag mit Google-Forms-Links auf `anmeldung.html`
- noch die Infokarten-Sektion („Alles auf einen Blick") auf der Startseite

Der Live-Stand (`7dd05a6`) hat das alles nicht mehr. Ich habe den lokalen Ordner per
Fast-Forward auf den Live-Stand gebracht (nichts überschrieben — es gab keine lokalen
Änderungen) und arbeite ab jetzt auf dem Branch **`feat/relaunch`**.

**Was das für dich heisst:** Falls du in den letzten Wochen lokal etwas bearbeitet und
nicht gepusht hast, wäre es verloren gewesen. War es nicht — der Ordner war sauber. Aber
für die Zukunft: immer `git pull` vor dem Arbeiten.

---

## 2. Seiten-Inventar

Sechs HTML-Dateien. Alle Texte unten sind **wörtlich** aus dem aktuellen Stand kopiert.

### 2.1 `index.html` — Startseite

`<title>`: `Improve your skills – Unihockey Skill Training Uster 2026`

| Bereich | Element | Aktueller Text |
|---|---|---|
| Navigation | Logo-Ersatztext | `Improve your skills` |
| | Links | `Über uns` · `Impressionen` · `Kontakt` · `Anmelden` |
| Hero | Badge | `Skill Training 2026` *(CSS macht daraus Grossbuchstaben)* |
| | Titel | `Improve` / `your` *(nur Outline)* / `skills.` |
| | Untertitel | `U14 Männer & U17 Frauen` |
| | Button 1 | `Jetzt anmelden` → `anmeldung.html` |
| | Button 2 | `Mehr erfahren ↓` → `ueber.html` |
| Was wir anbieten | Label | `Was wir anbieten` |
| | Titel | `Unihockey Skill Training in Uster` |
| | Absatz 1 (lead) | `Herzlich willkommen beim **Improve your skills** Skill Training – dem Tagescamp für Nachwuchsspieler:innen, die ihre Unihockey-Fähigkeiten gezielt auf das nächste Level bringen wollen.` |
| | Absatz 2 | `Wir bieten dir ein intensives, praxisnahes Training unter der Leitung von drei Schweizer Nationalspieler:innen. Egal ob du deine Schusstechnik, dein Stick-Handling oder dein taktisches Verständnis verbessern möchtest!` |
| | Absatz 3 | `Unsere Trainingsphilosophie: **Kleine Gruppen, maximale Wirkung.** Mit nur 30 Teilnehmer:innen pro Session hat jedes Kind die Möglichkeit, persönliches Feedback zu erhalten und sich spürbar zu verbessern.` |
| | Badges | `🏒 U14 Männer` · `🏒 U17 Frauen` |
| | Button | `Jetzt anmelden – CHF 48.–` |
| | Bild | `Bilder/Bild_Waswirmachen.JPG`, alt `Unihockey Skill Training` |
| CTA-Banner | Titel | `Bereit für den nächsten Schritt?` |
| | Hintergrundbild | `Bilder/cta-bg.jpg` — **existiert nicht** |
| Footer | Marke | `Improve your skills` |
| | Organisation | `Organisiert von Vanessa Schmuki, Pascal Schmuki & Claudio Schmid` |
| | Link | `Kontakt` |

> **Auffällig:** Das CTA-Banner enthält nur noch die Überschrift. Der frühere Untertitel
> („Nur noch wenige Plätze verfügbar – jetzt sichern.") und der Button wurden entfernt.
> Der Abschnitt endet damit in einer Sackgasse: grosse Frage, keine Antwort, kein Button.
> Ausserdem sind im Badge-Block noch die leeren Reste der gelöschten Badges „📍 Uster" und
> „📅 So 5. Juli 2026" (`index.html:87`).

### 2.2 `ueber.html` — Über uns

`<title>`: `Über uns – Improve your skills`

| Bereich | Element | Aktueller Text |
|---|---|---|
| Page-Header | Badge | `Das Team` |
| | Titel | `Über uns.` |
| | Untertitel | `Drei Nationalspieler:innen. Eine gemeinsame Idee.` |
| | Hintergrundbild | `Bilder/ueber-header.jpg` — **existiert nicht** |
| Unser Ansatz | Label | `Unser Ansatz` |
| | Titel | `Etwas zurückgeben.` |
| | Absatz 1 (lead) | `Wir haben alle von grossen Vorbildern und guten Trainern profitiert. Jetzt ist es an uns, dieses Wissen weiterzugeben.` |
| | Absatz 2 | `Das Skill Training ist nicht nur Sport – es ist eine Möglichkeit, Kindern zu zeigen, was möglich ist, wenn man gezielt trainiert und an sich glaubt. Wir bringen Erfahrungen aus dem Nationalteam und den besten Clubs Europas direkt auf die Halle in Uster.` |
| | Feature 1 | 🎯 `Technik-Fokus` — `Stick-Handling, Schuss, Bewegung – gezielt verbessert` |
| | Feature 2 | 👥 `Kleine Gruppen` — `Max. 30 Kinder – jedes Kind bekommt persönliches Feedback` |
| | Feature 3 | 🏆 `Top-Level Trainer` — `Nationalspieler:innen mit jahrelanger Wettkampferfahrung` |
| | Button | `Jetzt anmelden` |
| Karussell | 4 Bilder | siehe §3.1 (Slides 1–4) |
| Team | Label | `Eure Trainer` |
| | Titel | `Das Team dahinter.` |
| | Karte 1 | `Claudio Schmid` · `Organisator & Trainer` · `Nationalspieler · SVWE (Rekordmeister Schweizer Unihockey)` |
| | Karte 2 | `Pascal Schmuki` · `Organisator & Trainer` · `Nationalspieler · Storvreta IBK (Schweden, bester Verein der Welt)` |
| | Karte 3 | `Vanessa Schmuki` · `Organisatorin & Trainerin` · `Nationalspielerin · Weltmeisterin · 2-fache Schweizer Meisterin · Kloten-Dietlikon Jets` |
| Footer | Info | `Buchholz Sporthalle · 8610 Uster · So, 5. Juli 2026` ⚠️ altes Datum |

### 2.3 `impressionen.html` — Impressionen

`<title>`: `Impressionen – Improve your skills`

| Bereich | Element | Aktueller Text |
|---|---|---|
| Page-Header | Badge | `Galerie` |
| | Titel | `Impressionen.` |
| | Untertitel | `Eindrücke vom Skill Training – alle Fotos an einem Ort.` |
| | Button | `Zu den Bildern →` → **OneDrive** (`https://1drv.ms/f/c/5b3d63cbc09cd128/…`) |
| | Hintergrundbild | `Bilder/Bilderimpressionen-hintergrund.jpg.JPG` (13,1 MB) |
| Footer | Info | *(keine Zeile)* |

> Die Seite besteht **ausschliesslich** aus diesem Header. Kein Inhalt darunter, keine
> Galerie — nur der Weiterleitungs-Button zu OneDrive. Genau das ersetzt Phase 4.
> Die Sektion ist per Inline-Style auf `min-height: 80vh` gesetzt (`impressionen.html:33`).

### 2.4 `kontakt.html` — Kontakt

`<title>`: `Kontakt – Improve your skills`

| Bereich | Element | Aktueller Text |
|---|---|---|
| Page-Header | Badge | `Fragen? Meld dich!` |
| | Titel | `Kontakt.` *(kein Untertitel)* |
| Kontaktkarte | Titel | `Wir freuen uns von dir zu hören.` |
| | Absatz | `Bei Fragen rund um das Skill Training, Anmeldungen oder die Veranstaltung stehen wir dir gerne zur Verfügung.` |
| | Button | `✉️ Schreib uns eine E-Mail` → `mailto:pascal.schmuki@bluewin.ch` |
| Karte | Google-Maps-iFrame | `Sportanlage Buchholz Uster 8610 Schweiz`, Zoom 15 |
| Footer | Info | *(keine Zeile)* |

> Der frühere Info-Block (Datum, Ort, Zeiten, Preis) wurde entfernt. Die Kontaktkarte
> wirkt dadurch links sehr leer, während rechts die Karte volle Höhe hat.

### 2.5 `anmeldung.html` — Anmeldung

`<title>`: `Anmeldung – Improve your skills`

| Bereich | Element | Aktueller Text |
|---|---|---|
| Page-Header | Badge | `Anmeldung` |
| | Titel | `Bis 2027.` |
| | Untertitel | `Die Anmeldung für das Skill Training ist aktuell geschlossen.` |
| Hinweis | Icon | 📅 |
| | Label | `Save the Date` |
| | Titel | `Anmeldungen & Infos folgen im 2027.` |
| | Absatz | `Das nächste Improve-your-skills Skill Training in Uster ist bereits in Planung. Alle Details sowie die Anmeldung schalten wir rechtzeitig wieder hier auf. Schau zu gegebener Zeit einfach nochmals vorbei – wir freuen uns auf dich!` |
| | Button | `Zurück zur Startseite` |
| Footer | Info | `Buchholz Sporthalle · 8610 Uster` |

> Das ist der „geschlossen"-Zustand aus Briefing §2.4. Der frühere „offen"-Zustand
> (zwei Session-Panels, Preis, Google-Forms-Links) liegt in der Git-Historie
> (`d3e1ce7:anmeldung.html`) und dient in Phase 2 als Vorlage für den offenen Zustand.
> Das CSS dafür (`.session-split`, `.session-panel`, `.btn-booked` …) ist noch vollständig
> vorhanden — nur das HTML wurde entfernt.

### 2.6 `impressum.html` — Impressum ⚠️ verwaist

`<title>`: `Impressum – Improve your skills`

Blöcke: `Verantwortliche Personen` · `Kontakt` · `Veranstaltung` · `Datenschutz & Fotorechte` · `Haftungsausschluss` · `Urheberrecht`

**Diese Seite ist von keiner anderen Seite aus verlinkt.** Sie ist nur über die direkte
URL erreichbar. Zusätzlich hat sie als einzige Seite noch die **alte Navigation**
(`Home` · `Über uns` · `Kontakt` · `Anmelden`) — ohne „Impressionen", und mit dem alten
cremefarbenen Pill-Button für „Anmelden".

Inhaltliche Probleme (siehe §5.6) — die Seite wird in Phase 7 ersetzt, aber die
bestehenden Texte sind eine brauchbare Grundlage.

---

## 3. Bild-Inventar

### 3.1 Alle Dateien, grösste zuerst

| Grösse | Pixel | Verwendet? | Datei | Wird angezeigt als |
|---:|---|---|---|---|
| **15,8 MB** | 5091 × 3394 | ✅ | `Bilder/54878038952_978afe6028_o.jpg` | Hero-Slide 2 |
| **13,1 MB** | 6048 × 4024 | ✅ | `Bilder/Bilderimpressionen-hintergrund.jpg.JPG` | Impressionen-Header |
| **11,5 MB** | 6048 × 4024 | ✅ | `Bilder/Bild_Waswirmachen.JPG` | „Was wir anbieten", ~486 × 420 px |
| **10,5 MB** | 2917 × 4376 | ❌ | `Bilder/251203_sv_wiler-ersigen_vs_tigers_langnau-23_54961034442_o.jpg` | — |
| **10,4 MB** | 6000 × 4000 | ❌ | `Bilder/55193731924_974d7db19d_o.jpeg` | — |
| **9,3 MB** | 6000 × 4000 | ❌ | `Bilder/55193479461_68f6bd1077_o.jpeg` | — |
| **9,2 MB** | 6000 × 4000 | ❌ | `Bilder/55193628038_e88d3f2138_o.jpeg` | — |
| **9,1 MB** | 6000 × 4000 | ✅ | `Bilder/55193886120_4a1069cdcf_o.jpeg` | Hero-Slide 1 |
| **8,9 MB** | 4295 × 2863 | ✅ | `Bilder/54560170314_01b6b9c809_o.jpeg` | Karussell Slide 2 |
| **8,7 MB** | 6000 × 4000 | ❌ | `Bilder/54711409664_1030ec501e_o.jpeg` | — |
| **2,4 MB** | 1074 × 1611 | ✅ | `Bilder/5_claudio_schmid.png` | Team-Foto, **160 × 160 px** |
| **850 KB** | 1206 × 2144 | ✅ | `Bilder/1ECD3D4C-B83D-4BF2-B8C0-EE69FF124190.jpg` | Karussell Slide 4 |
| **670 KB** | 1920 × 1280 | ✅ | `54923280127_69f6204584_k.jpg` | Hero-Slide 3 *(liegt im Wurzelverzeichnis)* |
| **609 KB** | 2200 × 1467 | ✅ | `Bilder/54984091234_0a498c59d6_o.jpg` | Karussell Slide 1 |
| **381 KB** | 2200 × 1467 | ✅ | `Bilder/54983832553_b1dfd1ce04_o.jpg` | Karussell Slide 3 |
| **185 KB** | 1600 × 900 | ❌ | `Bilder/Symboldbild_Unihockey.jpg` | *(war früher „Was wir anbieten")* |
| **126 KB** | 1200 × 1200 | ✅ | `Bilder/20_vanessa_schmuki.jpg` | Team-Foto, 160 × 160 px |
| **88 KB** | 689 × 827 | ✅ | `Bilder/17_pascal_schmuki.jpg.avif` | Team-Foto, 160 × 160 px |

**Gesamt: 111,5 MB in 18 Dateien.** Davon **48,2 MB in 5 Dateien ungenutzt** (❌).

### 3.2 Was jede Seite tatsächlich lädt

| Seite | Bild-Last | Bemerkung |
|---|---:|---|
| **`index.html`** | **37,0 MB** | Alle 3 Hero-Bilder werden **sofort und gleichzeitig** geladen (26,7 MB), obwohl nur eines sichtbar ist. Dazu 11,5 MB für „Was wir anbieten". |
| **`ueber.html`** | **13,3 MB** | Alle 4 Karussell-Bilder sofort (10,7 MB) + 2,6 MB Team-Fotos. |
| **`impressionen.html`** | **13,1 MB** | Ein einziges Hintergrundbild. |
| `kontakt.html` | 0 MB | Nur Google-Maps-iFrame. |
| `anmeldung.html` | 0 MB | — |
| `impressum.html` | 0 MB | — |

**Einordnung:** 37 MB bedeuten auf einer normalen Schweizer Mobilverbindung
(~20 Mbit/s effektiv) rund **15 Sekunden**, bis das Hero-Bild steht. Kein `loading="lazy"`,
kein `srcset`, keine Grössenangaben, kein WebP — jedes Bild wird in Originalauflösung an
jedes Handy ausgeliefert.

Die krassesten Missverhältnisse:

- `Bild_Waswirmachen.JPG`: **11,5 MB** für eine Fläche von **486 × 420 px**. Ein sauber
  komprimiertes WebP in der doppelten Anzeigegrösse wäre ~80 KB → **rund 145× kleiner**.
- `5_claudio_schmid.png`: **2,4 MB PNG** für einen **160-px-Kreis**. Als WebP ~18 KB →
  **rund 135× kleiner**.
- Hero-Slide 2: **15,8 MB** für ein Hintergrundbild, das mit `opacity`-Überlagerung zu
  ~30 % sichtbar ist.

> Damit ist dein „Bilder laden sehr langsam" vollständig erklärt — und es ist ohne
> Redesign lösbar. Realistisches Ziel nach Phase 7: **Startseite unter 400 KB Bild-Last**,
> also Faktor ~90 weniger, bei gleichem Aussehen.

### 3.3 Referenziert, aber nicht vorhanden

| Datei | Referenziert in | Sichtbare Folge |
|---|---|---|
| `Bilder/logo.png` | **allen 6 Seiten** (Favicon **und** Navigations-Logo) | Kein Logo, kein Favicon. Die Navigation zeigt auf jeder Seite den Text-Ersatz „Improve your skills". Der `onerror`-Handler fängt es ab, aber im Browser-Tab bleibt das Standard-Icon. |
| `Bilder/cta-bg.jpg` | `index.html:104` | CTA-Banner bleibt einfarbig dunkelgrün. |
| `Bilder/ueber-header.jpg` | `ueber.html:33` | Über-uns-Header bleibt einfarbig dunkelgrün. |
| `bilder/logo.png` *(klein geschrieben)* | `impressum.html:16` | Zusätzlicher Schreibfehler — würde auch dann scheitern, wenn das Logo existierte, weil GitHub Pages Gross-/Kleinschreibung unterscheidet. |

Das Logo war **nie** im Repository — ich habe die gesamte Git-Historie geprüft.
**Ich brauche von dir eine Logo-Datei** (siehe §7).

### 3.4 Sonstige Auffälligkeiten

- `Bilder/Bilderimpressionen-hintergrund.jpg.JPG` hat eine **doppelte Endung**.
- `Bilder/17_pascal_schmuki.jpg.avif` ebenfalls (`.jpg.avif`). AVIF wird von älteren
  Safari-Versionen nicht unterstützt — auf iOS < 16 fehlt Pascals Foto ersatzlos.
- `54923280127_69f6204584_k.jpg` liegt als einziges Bild **nicht** im `Bilder/`-Ordner.
- Ordner- und Dateinamen mischen Deutsch, Englisch, Flickr-IDs und iPhone-UUIDs.
  In Phase 4 kommt eine einheitliche Konvention (`gallery/{jahr}/{uuid}_{grösse}.webp`).
- `.DS_Store` (macOS-Systemdatei) ist eingecheckt — gehört in `.gitignore`.

---

## 4. Schriften — Annahme im Briefing trifft nicht zu

Im Briefing steht: *„sie sind, soweit ich weiss, rein per CSS gestylt, ohne externen
Font-Dienst — bitte bestätigen"*.

**Das ist nicht der Fall.** Auf **allen sechs Seiten** steht in `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
```

Es werden also **zwei Google-Web-Fonts** geladen:

| Rolle | Schrift | Geladene Schnitte | CSS-Variable |
|---|---|---|---|
| Display / Überschriften | **Syne** | 700, 800 | `--font-head` (`style.css:16`) |
| Fliesstext | **DM Sans** | 300, 400, 500 + kursiv 300 | `--font-body` (`style.css:17`) |

Stacks exakt: `'Syne', sans-serif` und `'DM Sans', sans-serif` — beide ohne weitere
Fallbacks, d. h. bis die Schriften geladen sind, rendert der Browser die System-Sans.

**Drei Probleme damit:**

1. **Performance:** Zwei zusätzliche Verbindungen zu `fonts.googleapis.com` und
   `fonts.gstatic.com`, bevor Text erscheint — render-blockierend.
2. **Datenschutz (revDSG/DSGVO):** Beim Laden geht die **IP-Adresse jeder Besucherin an
   Google in die USA**. In Deutschland wurde genau das abgemahnt. Für eine Website mit
   Minderjährigen als Zielgruppe ist das unnötiges Risiko — und es widerspricht der
   Entscheidung im Briefing, cookielos und ohne Consent-Banner auszukommen.
3. **Fehlende Schnitte:** Das CSS benutzt DM Sans in **600** (`style.css:374`) und
   **700** (`style.css:371`, `395`). Beide werden **nicht geladen** — der Browser rechnet
   sie künstlich fett („faux bold"), was leicht anders aussieht als echtes Fett. Und
   umgekehrt wird **kursiv 300 geladen, aber nirgends verwendet** — reiner Ballast.

**Mein Vorschlag (Phase 1, brauche dein OK):** `next/font/google` verwenden. Das lädt
Syne und DM Sans **beim Build herunter und liefert sie von unserer eigenen Domain aus**.
Es sind **exakt dieselben Schriftdateien** — die Website sieht zu 100 % identisch aus.
Es entfällt nur die Verbindung zu Google. Zusätzlich würde ich die tatsächlich benutzten
Schnitte laden (DM Sans 300/400/500/600/700, Syne 700/800) und Kursiv weglassen.

**Das ist kein Schriftwechsel.** Ich tausche nichts gegen etwas „Ähnliches" aus. Sag mir
bitte trotzdem ausdrücklich Ja, weil es die Schrift berührt.

---

## 5. Fehler und Inkonsistenzen im Bestand

### 5.1 Drei verschiedene Footer

| Seiten | Zeile „footer-info" |
|---|---|
| `index.html`, `impressionen.html`, `kontakt.html` | *(fehlt komplett)* |
| `anmeldung.html` | `Buchholz Sporthalle · 8610 Uster` |
| `ueber.html`, `impressum.html` | `Buchholz Sporthalle · 8610 Uster · **So, 5. Juli 2026**` |

Auf `ueber.html` steht also im Footer noch das Datum eines vergangenen Anlasses, während
`anmeldung.html` gleichzeitig „Bis 2027" sagt. → Behoben in Phase 2 durch `site_settings`.

### 5.2 Ungültiges HTML

| Datei | Problem |
|---|---|
| `index.html` | **`</html>` fehlt komplett** (Datei endet nach `</body>`). |
| `ueber.html` | Nach `</html>` folgt noch ein **Textfragment** (`<p class="hero-sub">Drei Nationalspieler:innen…</p></div></section>`) — Rest eines Copy-Paste-Fehlers. |
| `kontakt.html` | Das Cloudflare-Script steht **zwischen `</body>` und `</html>`**. |
| `impressum.html` | Ein `<div class="impressum-block">` wird **nie geschlossen** (Z. 39–43), ein `<p>` ebenfalls nicht (Z. 48). |
| `anmeldung.html` | Leerzeile **vor** `<!DOCTYPE html>`. |

Browser reparieren das stillschweigend, deshalb fällt es nicht auf. Beim Umbau auf
React/Next.js verschwindet die ganze Kategorie automatisch.

### 5.3 Toter Code im CSS

`style.css` ist 33 KB und enthält vollständige Stile für Bereiche, die **auf keiner Seite
mehr vorkommen**:

- Formular-System (`.form-card`, `.form-group`, `.steps`, `.step-number`, …) — ~60 Zeilen
- Foto-Einwilligung mit Radio-Buttons (`.foto-frage-box`, `.radio-*`) — ~15 Zeilen
- Galerie-Raster (`.gallery-grid`, `.gallery-item`, `.gallery-label`) — ~15 Zeilen
- Info-Karten (`.info-card*`) — ~10 Zeilen
- Session-Panels (`.session-split`, `.btn-booked`, `.session-divider`) — ~25 Zeilen
- `.kontakt-grid`, `.btn-full`, `.hero-img`, `.about-image`, `.img-placeholder-tall`

**Wichtig: Das ist kein Wegwerf-Material.** Genau diese Stile brauchen wir wieder für das
Kontaktformular (Phase 5), die Galerie (Phase 4) und den offenen Anmeldezustand (Phase 2).
Ich hebe sie auf, statt sie zu löschen — sie sind der Beleg dafür, wie diese Elemente
**in deiner Bildsprache** aussehen sollen.

### 5.4 Doppelter Code in jeder Datei

Navigation, Footer, Burger-Menü-Script und der Cloudflare-Beacon sind **sechsmal
kopiert**. Eine Änderung an der Navigation heisst heute: sechs Dateien anfassen — und
genau deshalb hat `impressum.html` noch die alte Navigation. Nach Phase 1: eine Datei.

### 5.5 Barrierefreiheit

- Der Burger-Button hat `aria-label="Menu"`, aber kein `aria-expanded` — Screenreader
  erfahren nicht, ob das Menü offen ist.
- Das mobile Menü fängt den Tastaturfokus nicht ein und lässt sich nicht mit `Esc` schliessen.
- Karussell-Bilder haben die Alt-Texte `Slide 1`–`Slide 4` — inhaltsleer.
- Die Hero-Bilder tragen Personennamen als Alt-Text (`Pascal Schmuki` …), sind aber rein
  dekorativ und mehrfach überlagert.
- Kontrast `--text-muted` (#4a6b62) auf Weiss: **4,9 : 1** → besteht AA für Fliesstext,
  aber `.team-bio` und `.form-note` setzen das auf 0,78 rem ≈ 12,5 px — das ist grenzwertig klein.
- `.hero-title .accent` ist reine Outline-Schrift (`-webkit-text-stroke`) — in Browsern
  ohne diese Eigenschaft wird das Wort **unsichtbar** (`color: transparent`).

### 5.6 Inhaltliche Fehler im Impressum

| Stelle | Problem |
|---|---|
| Adresse | `4656 Starrkich-Wil` — vermutlich Tippfehler, korrekt ist **Starrkirch-Wil**. |
| E-Mail | Der **Linktext** lautet `info@improveyourskills.ch`, das **Ziel** ist aber `mailto:claudio.schmid@active.ch`. Zwei verschiedene Adressen. |
| Datum | `Datum: 4. Juli 2026` — überall sonst steht **5. Juli 2026**. |
| Zahlungsdienst | Nennt **Payrexx** als Auftragsverarbeiter. Auf der Website ist davon nichts zu sehen — die Anmeldung lief über Google Forms. |
| Fotorechte | Sagt, Fotos würden „**nicht** ohne ausdrückliche Zustimmung im Internet … veröffentlicht" und „**nach der Veranstaltung gelöscht**". Das steht im direkten Widerspruch zur geplanten öffentlichen Galerie (Phase 4). |
| Verantwortliche | Nennt **nur Claudio Schmid**, obwohl drei Personen organisieren. |

> Der letzte Punkt ist der wichtigste: **Bevor die Galerie live geht, muss dieser Absatz
> überarbeitet werden**, sonst widerspricht die eigene Website ihrer eigenen Zusage.
> Ich bin keine Rechtsberatung — in Phase 7 liefere ich einen strukturierten Entwurf,
> den du prüfen und ergänzen musst.

### 5.7 Weitere Beobachtungen

- **Google Maps iFrame** (`kontakt.html`) setzt Google-Cookies und lädt Google-Ressourcen —
  derselbe Datenschutzpunkt wie bei den Fonts, und er untergräbt die Begründung
  „kein Consent-Banner nötig". Ich schlage in Phase 5 vor: statisches Kartenbild mit
  Link zu Google Maps, oder Karte erst nach Klick laden. Braucht deine Entscheidung.
- **Cloudflare-Beacon-Token** `b2657f18…` steht im Klartext im HTML. Das ist bei
  Cloudflare Web Analytics **normal und unbedenklich** — es ist ein öffentlicher Token.
- **Kein `robots.txt`, keine `sitemap.xml`, keine Meta-Descriptions, kein Open Graph.**
  Beim Teilen in WhatsApp erscheint nur der nackte Link ohne Vorschaubild.
- **`CNAME` = `www.improveyourskills.ch`** — die Website läuft also auf **www**, nicht auf
  der nackten Domain. Wichtig für die DNS-Umstellung in Phase 7.
- **`html { scroll-behavior: smooth }`** ist global gesetzt und ignoriert
  `prefers-reduced-motion`.

---

## 6. JavaScript-Verhalten, das erhalten bleiben muss

Alles Verhalten steckt in `<script>`-Blöcken am Seitenende — keine externen JS-Dateien.

| # | Verhalten | Vorkommen | Portierung |
|---|---|---|---|
| 1 | **Navbar-Scroll-Zustand** — ab Scroll-Position wird `.scrolled` gesetzt (dunkler Hintergrund, Blur, weniger Höhe). Schwelle: **60 px** auf der Startseite, **0 px** auf allen Unterseiten. | alle 6 Seiten | Client-Komponente. Schwellenwert-Unterschied beibehalten. |
| 2 | **Burger-Menü** — Klick schaltet `.open` auf Menü und Button (Hamburger wird zum X); Klick auf einen Link schliesst wieder. | 5 Seiten (**nicht** `impressum.html`) | Client-Komponente. **Dabei ergänzen:** `aria-expanded`, Fokus-Falle, `Esc`, Scroll-Sperre. |
| 3 | **Hero-Slider** — 3 Bilder, Crossfade alle **5000 ms**, `setInterval`, kein Bedienelement. | `index.html` | Client-Komponente. Muss auf `prefers-reduced-motion` reagieren und darf nur das erste Bild sofort laden. |
| 4 | **Über-uns-Karussell** — 4 Bilder, Pfeile ←/→, klickbare Punkte, Autoplay alle **6000 ms**, Timer wird bei manueller Bedienung zurückgesetzt, umlaufend. Punkte werden per JS erzeugt. | `ueber.html` | **Muss 1:1 erhalten bleiben** (Briefing Phase 6). Dabei Tastaturbedienung + Alt-Texte ergänzen. |
| 5 | **Fade-in beim Scrollen** — `IntersectionObserver`, Schwelle 0.1, setzt `.visible`. Beobachtete Elemente je Seite unterschiedlich. | `index.html`, `ueber.html`, `kontakt.html` | Wird in Phase 6 zur allgemeinen Scroll-Reveal-Lösung ausgebaut. |
| 6 | **`onerror`-Bild-Fallbacks** — bei fehlendem Bild wird eine Platzhalter-Klasse gesetzt (grüner Verlauf mit 📷 bzw. 👤). | alle Seiten | **Konzeptionell wichtig:** genau dieses Muster wird in Phase 3 zum Platzhalter-Zustand im Admin („Platzhalter — noch kein Bild"). |
| 7 | **Einstiegs-Animation** — `.animate-up` mit gestaffelten Verzögerungen (0,1 / 0,25 / 0,4 / 0,55 / 0,7 s). Reines CSS. | `index.html` Hero, `.animate-up` | ⚠️ Konflikt mit Briefing Phase 6 („keine Animation im ersten Viewport der Startseite"). Siehe §7. |

---

## 7. Offene Fragen an dich

Nichts davon blockiert Phase 1 — ausser Frage 1, die die Schrift betrifft.

1. **Google Fonts → selbst hosten?** (§4) Gleiche Schrift, gleiches Aussehen, nur ohne
   Verbindung zu Google. Ich brauche dein Ja, weil es die Marke berührt. — *Meine Empfehlung: ja.*

2. **Logo.** `Bilder/logo.png` existiert nicht und war nie im Repository. Hast du eine
   Logo-Datei? Am liebsten SVG, sonst PNG mit mindestens 512 px Höhe und transparentem
   Hintergrund. Falls es keines gibt: soll der Text „Improve your skills" in Syne dauerhaft
   das Logo sein? Dann baue ich das sauber statt als Fehler-Ersatz.

3. **Hero-Animation.** Briefing Phase 6 sagt „keine Animation im ersten Viewport der
   Startseite". Heute ist genau dort die gestaffelte `.animate-up`-Einblendung — sie ist
   ein prägender Teil des ersten Eindrucks. Ich würde sie **behalten**, aber so umbauen,
   dass der Text sofort lesbar ist (Bewegung ohne `opacity: 0`-Start). Einverstanden?

4. **Google Maps** (§5.7). Karte wie heute lassen, oder datenschutzfreundlich erst nach
   Klick laden? — *Meine Empfehlung: erst nach Klick, passend zur Cookie-Banner-Begründung.*

5. **Ungenutzte Bilder** (48,2 MB, §3.1). Löschen, oder sind das Kandidaten für die
   Galerie 2026? Ich lösche **nichts** ohne dein Wort.

6. **Impressum-Fotorechte** (§5.6). Der aktuelle Text verspricht, Fotos **nicht** zu
   veröffentlichen und nach dem Anlass zu löschen. Das widerspricht der geplanten Galerie.
   Wie ist die reale Lage — habt ihr Einwilligungen, die eine Veröffentlichung decken?

7. **`impressionen.html` Inhalt.** Die Seite hat ausser dem Header nichts. Sollen die
   OneDrive-Fotos in die neue Galerie migriert werden, oder fängst du 2027 neu an?

8. **Sprachen.** Für wen sind EN und FR? Wenn das Training rein regional in Uster ist,
   kostet die Übersetzung Aufwand in jeder Phase. Kein Widerspruch — ich will nur sicher
   sein, dass es gewollt ist.

---

## 8. Wo die Marke definiert ist

Alle Marken-Werte stammen aus **`style.css`**, überwiegend aus dem `:root`-Block
(Zeilen 4–19). Sie sind vollständig nach `src/styles/tokens.css` übertragen — mit
Quellenangabe pro Wert.

**Kern der Identität:**

| | Wert | Herkunft |
|---|---|---|
| Dunkelgrün | `#102C26` | `style.css:5` |
| Grün mittel | `#1a4037` | `style.css:6` |
| Creme | `#F7E7CE` | `style.css:7` |
| Creme dunkel | `#eddbb8` | `style.css:8` |
| Text dunkel | `#0d1f1c` | `style.css:10` |
| Text gedämpft | `#4a6b62` | `style.css:11` |
| Display-Schrift | Syne 700/800 | `style.css:16` |
| Fliesstext | DM Sans 300/400/500 | `style.css:17` |
| Radius klein | 12 px | `style.css:12` |
| Radius Karte | 20 px | `style.css:13` |
| Radius Pill | 100 px | 8 Fundstellen |
| Schatten | `0 4px 24px rgba(16,44,38,.12)` | `style.css:14` |
| Schatten gross | `0 12px 48px rgba(16,44,38,.2)` | `style.css:15` |
| Übergang | `.35s cubic-bezier(.4,0,.2,1)` | `style.css:18` |

**Zwei Dinge, die im Original nicht als Variable existierten** und die ich benannt habe,
ohne den Wert zu ändern:

1. **Die Transparenz-Skalen.** `rgba(16,44,38,x)` und `rgba(247,231,206,x)` stehen über
   40× von Hand im CSS. Beide sind exakt Dunkelgrün bzw. Creme. In `tokens.css` sind sie
   als Skala benannt (`--color-cream-a75` usw.), damit sie konsistent bleiben.
2. **Die Statusfarben.** `#c94a4a` / `#b03d3d` (Ausgebucht-Button, `style.css:361–362`)
   und `#8b1a1a` / `rgba(200,50,50,…)` (Formularfehler, `style.css:387`).

> **Zum Briefing-Punkt „falls du ein Fehler-Rot brauchst, leite es ab und lass es
> freigeben":** Nicht nötig. Es gibt bereits ein Rot in deinem CSS — ich habe es
> übernommen statt ein neues zu erfinden. **Ich habe keine einzige neue Farbe angelegt.**

---

## 9. Was Phase 1 aus diesem Audit mitnimmt

- Pixelgleichheit ist realistisch: eine CSS-Datei, drei Breakpoints, kein Framework,
  keine Abhängigkeiten.
- Die drei fehlenden Bilder sind **kein** Fehler, den ich beheben darf — sie sind
  Platzhalter-Zustände, die genau so aussehen müssen wie heute, bis du Bilder lieferst.
- Der grösste Gewinn liegt nicht im Code, sondern in den Bildern (111,5 MB → Zielgrösse
  unter 2 MB für die ganze Website).
- Das mobile Menü existiert bereits (`style.css:447–474`) und muss **nicht neu erfunden**
  werden — nur zugänglich gemacht. Briefing Phase 1.7 vermutet, es gebe keines.
