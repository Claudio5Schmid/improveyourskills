---
name: Improve your skills
description: Unihockey Skill Training in Uster — ein Hallenplakat aus Tannengrün und Sandcreme.
colors:
  green-dark: "#102c26"
  green-mid: "#1a4037"
  cream: "#f7e7ce"
  cream-dark: "#eddbb8"
  white: "#ffffff"
  text-dark: "#0d1f1c"
  text-muted: "#4a6b62"
  danger: "#c94a4a"
  danger-hover: "#b03d3d"
  danger-text: "#8b1a1a"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontSize: "clamp(3.5rem, 10vw, 7.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Syne, sans-serif"
    fontSize: "clamp(1.8rem, 4vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Syne, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.65
    letterSpacing: "0.18em"
rounded:
  input: "12px"
  card: "20px"
  pill: "100px"
  round: "50%"
spacing:
  space-6: "8px"
  space-9: "12px"
  space-11: "16px"
  space-15: "24px"
  space-17: "32px"
  space-19: "40px"
  space-21: "48px"
  space-26: "100px"
components:
  button-primary:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.green-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green-dark}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-full:
    backgroundColor: "{colors.green-dark}"
    textColor: "{colors.cream}"
    rounded: "{rounded.input}"
    padding: "16px"
    width: "100%"
  badge:
    backgroundColor: "rgba(16, 44, 38, 0.07)"
    textColor: "{colors.green-dark}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
    height: "44px"
  chip-active:
    backgroundColor: "{colors.green-dark}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.card}"
    padding: "32px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.input}"
    padding: "10px 14px"
  hero-tag:
    backgroundColor: "rgba(247, 231, 206, 0.15)"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 18px"
---

# Design System: Improve your skills

## Overview

**Creative North Star: "Das Hallenplakat"**

Die Seite ist ein Plakat, das man in der Halle aufhängen würde. Ein Foto liegt
unter einem schweren tannengrünen Schleier, darüber steht ein dreizeiliger
Schriftzug in Syne, so gross wie die Fläche es zulässt — und die mittlere Zeile
ist nur als Kontur gesetzt. Das ist kein Effekt, das ist die Marke: dieselbe
Form (voll / hohl / voll) steckt im Favicon. Wer das Plakat versteht, versteht
das System.

Der Charakter ist **sportlich, direkt, energisch** — aber die Energie steckt in
wenigen, grossen Entscheidungen, nicht in vielen kleinen. Grosse tannengrüne
Felder wechseln mit hellen Flächen; dazwischen liegt fast nichts. Die Seite wird
laut, wo sie etwas behauptet (Hero, Sektionstitel, ganzflächige Grünfelder), und
wird sofort wieder still, damit das Laute trifft. Ein Plakat, das überall schreit,
liest niemand.

Alles, was man anfasst, ist eine Pille: Buttons, Badges, Jahres-Chips, der
Hero-Tag. Alles, was etwas enthält, ist eine Karte mit 20 px Radius. Alles, was
ein Gesicht zeigt, ist ein Kreis. Es gibt kein viertes Formvokabular, keine
dritte Schrift und keine dritte Hintergrundfamilie. Diese Strenge ist der Grund,
warum die Seite mit sehr wenigen Bauteilen seriös wirkt — bei einem privaten,
nicht-kommerziellen Projekt, das Eltern in zwei Minuten auf dem Handy überzeugen
muss, ist genau das die Aufgabe.

**Key Characteristics:**

- Zwei Farbfelder, kein drittes: tannengrün oder hell — nie etwas dazwischen.
- Display-Typografie an der Belastungsgrenze: `clamp(3.5rem, 10vw, 7.5rem)`, Zeilenhöhe 0.95, negatives Tracking.
- Genau eine typografische Signatur: das konturierte Wort.
- Pille · Karte · Kreis — mehr Formen gibt es nicht.
- Jede Transparenz ist aus den zwei Markenfarben komponiert, nie aus Grau.
- Fotos erscheinen nie roh: immer unter einem grünen Schleier oder in einer 20-px-Karte.
- Leere Daten erzeugen keine leere Fläche — die Sektion verschwindet.

## Colors

Zwei Farben tragen alles; alles andere sind Transparenzstufen genau dieser zwei.

### Primary

- **Tannengrün** (`#102c26`): die Markenfarbe und gleichzeitig die dunkle
  Grundfläche. Hero-Schleier, Navigationsleiste im gescrollten Zustand,
  Sektionsflächen (`.section-dark`), Zahlen-Band, Fusszeile, aktiver Jahres-Chip,
  Formular-Button auf hellem Grund. Auf dieser Fläche ist Text **immer** Sandcreme.
- **Tannengrün mittel** (`#1a4037`): ausschliesslich als Hover-Partner und als
  zweiter Gradient-Stopp in Bild-Platzhaltern. Nie als eigenständige Fläche —
  es ist der Zwischenschritt, nicht die Farbe.

### Secondary

- **Sandcreme** (`#f7e7ce`): der Gegenpol. Text auf Grün, Fläche unter Karten
  (`.section-cream`, Eckdaten-, Zitat-Karten), Hintergrund des primären Buttons.
  Sandcreme ist auf dieser Seite eine **Lichtfarbe** — sie steht für das Warme
  im Dunkeln, nicht für Papier.
- **Sandcreme dunkel** (`#eddbb8`): gedrückter Zustand und der ruhige Untergrund
  eines noch nicht geladenen Portraits.

### Neutral

- **Reines Weiss** (`#ffffff`): der Standard-Seitenhintergrund und die Fläche von
  Eingabefeldern und inaktiven Chips. Weiss ist hier die neutrale Bühne, nicht
  die Markenfläche.
- **Tiefes Textgrün** (`#0d1f1c`): Fliesstext auf hellem Grund. Kein Schwarz —
  der Text ist minimal grünstichig, damit er zur Palette gehört.
- **Gedämpftes Salbeigrün** (`#4a6b62`): Sekundärtext, Eyebrow-Labels,
  Rollenzeilen unter Namen.

### Tertiary

- **Signalrot** (`#c94a4a`, Hover `#b03d3d`, Text `#8b1a1a`): der einzige Hue
  ausserhalb Grün/Creme. Er existiert für zwei Dinge — Formularfehler und den
  „Ausgebucht"-Zustand.

### Named Rules

**The Two-Field Rule.** Jede Fläche ist entweder ein tannengrünes Feld oder ein
helles Feld (Weiss oder Sandcreme). Es gibt keine dritte Hintergrundfamilie.
Daraus folgt die Textfarbe automatisch: auf Grün immer Sandcreme, auf Hell immer
das tiefe Textgrün. Wer eine Textfarbe wählen muss, hat die falsche Fläche.

**The Alpha-From-Brand Rule.** Jede Transparenz wird aus `--rgb-green-dark` oder
`--rgb-cream` komponiert — nie aus Grau, nie aus einem neuen Hue. Prüftest:
`grep 'rgba('` in einer Komponente; jeder Treffer muss auf ein Triplett-Token
zeigen. (Zwei Ausnahmen sind dokumentiert und begründet: die reinen
Schwarz-Schatten `--color-black-a15/a20` unter hellen Buttons auf dunklem Grund,
wo ein grüner Schatten unsichtbar wäre.)

**The One Red Rule.** Rot ist kein Gestaltungsmittel. Es erscheint nur, wenn
etwas nicht funktioniert hat oder etwas nicht mehr verfügbar ist. Ein rotes
Element, das weder Fehler noch Ausverkauft-Zustand ist, ist ein Fehler im Entwurf.

## Typography

**Display Font:** Syne (selbst gehostet über `next/font`, Fallback `sans-serif`)
**Body Font:** DM Sans (selbst gehostet, Fallback `sans-serif`)

**Character:** Syne ist breit, geometrisch und in 800 fast plakathaft massiv —
sie liefert die ganze Lautstärke. DM Sans ist daneben bewusst unauffällig, eher
leicht als kräftig (300/400), mit grosszügiger Zeilenhöhe. Die Spannung zwischen
den beiden ist das Layout: ein sehr lautes Element pro Bildschirm, alles andere
leise.

### Hierarchy

- **Display** (Syne 800, `clamp(3.5rem, 10vw, 7.5rem)`, Zeilenhöhe 0.95, Tracking −0.03em): nur der Hero der Startseite. Drei Zeilen, umbrochen von Hand, damit die Silhouette stimmt.
- **Headline** (Syne 800, `clamp(1.8rem, 4vw, 2.75rem)`, Zeilenhöhe 1.05, Tracking −0.03em): Sektionstitel. Bewusst eine Stufe kleiner als früher, damit sie als Inhalt und nicht als zweiter Hero liest. Auf Grün mit `.light` in Sandcreme.
- **Seitentitel** (Syne 800, `clamp(1.75rem, 4.5vw, 2.75rem)`, Zeilenhöhe 1): der Kopf jeder Unterseite. Klein genug, dass der erste Bildschirm nicht nur aus Titel besteht.
- **Title** (Syne 700, 1.15rem, Zeilenhöhe 1.2): Namen auf Trainerkarten, Lead-Absätze, Fusszeilen-Wortmarke.
- **Body** (DM Sans 400, 0.95rem, Zeilenhöhe 1.65): Fliesstext. Lange Absätze laufen auf 1.75 (`--line-height-loose`) und stehen in einem 700-px-Container, nicht über die volle Breite.
- **Label** (DM Sans 500, 0.75rem, Tracking 0.18em, Grossbuchstaben): das Eyebrow über jedem Sektionstitel. Auf Grün in Sandcreme bei 50 % Deckkraft.

### Named Rules

**The Hollow Middle Rule.** Das konturierte Wort (`-webkit-text-stroke: 2px`,
Füllung transparent) ist die einzige typografische Signatur der Marke. Sie kommt
höchstens **einmal pro Seite** vor, nur in einer Display-Zeile, nur auf einem
grünen Feld, und nur auf ein kurzes Wort in der Mitte. Dieselbe Figur — voll,
hohl, voll — ist das Favicon. Wird sie beliebig wiederholt, verliert die Marke
ihr einziges Erkennungsmerkmal.

**The Two-Voice Rule.** Syne für Display, Headline, Title und die Wortmarke.
DM Sans für alles, was jemand als Satz liest. Es gibt keine dritte Schrift, keine
Monospace, keine Kursive.

**The Whisper Label Rule.** Über jedem Sektionstitel steht ein Eyebrow-Label in
0.75rem, Grossbuchstaben, 0.18em Tracking, gedämpft. Es benennt die Sektion und
tritt sofort zurück. Ein Label, das mit dem Titel um Aufmerksamkeit kämpft, ist
zu gross oder zu dunkel.

## Layout

Ein einziger Container von **1100 px** mit 32 px Gutter (24 px auf Mobile) trägt
den ganzen Inhalt; Fliesstext läuft zusätzlich in einer schmalen Variante von
700 px. Vertikal atmet die Seite grosszügig: 100 px Sektionspolster oben und
unten, 48 px zwischen Sektionstitel und Inhalt, 32 px als Standardabstand in
Rastern, 16 px als Arbeitsabstand innerhalb einer Gruppe.

Raster sind fast immer `auto-fit`/`minmax`, nicht feste Spaltenzahlen — Eckdaten
ab 180 px, Zitate ab 260 px, Zahlen ab 140 px. Das Team ist die Ausnahme: drei
feste Spalten, weil es genau drei Trainer:innen gibt. Die Galerie ist ein
CSS-Multi-Column-Masonry (2 → 3 ab 640 px → 4 ab 1000 px), bei dem jede Kachel
ihre Höhe vorab aus den gespeicherten Bildmassen reserviert.

Drei Breakpoints, mehr nicht: **480 px** (einspaltig, engere Sektionen),
**768 px** (Burger-Menü erscheint), **900 px** (zweispaltige Raster klappen um).
Medienflächen sind 420 px hoch, auf Mobile 280 px. Die Seite darf zwischen
320 und 1920 px an keiner Stelle horizontal scrollen.

### Named Rules

**The 1100 Rule.** Inhalt lebt im 1100-px-Container. Nur drei Dinge gehen über
die volle Breite: grüne Sektionsflächen, Medien-Banner und der Hero. Ein
vollflächiges Textelement ist ein Entwurfsfehler.

**The Empty-Section Rule.** Eine Sektion ohne Daten rendert nicht. Keine leere
Karte, kein „coming soon", kein Platzhalterbalken. Das ist keine Sparmassnahme,
sondern die Bedingung dafür, dass die Seite zwischen zwei Editionen ehrlich
aussieht.

## Elevation & Depth

Tiefe entsteht in erster Linie **flächig**: ein tannengrünes Feld liegt vor einem
hellen, eine Sandcreme-Karte vor Weiss. Schatten sind weich, gross und immer
markengetönt (grün, nie neutralgrau) — sie modellieren nicht, sie heben nur an.

**Doktrin (entschieden, noch nicht vollständig im Code umgesetzt):** Flächen
liegen im Ruhezustand flach; Schatten sind die **Antwort** auf Hover oder Fokus,
nicht die Grundausstattung. Heute tragen Eckdaten-, Zitat- und Trainerkarten
bereits im Ruhezustand `--shadow-card`. Das ist der bekannte Abstand zwischen
dieser Doktrin und dem Bestand — er wird in einem eigenen Schritt geschlossen,
nicht nebenbei. Neue Komponenten folgen ab sofort der Doktrin.

### Shadow Vocabulary

- **Karte** (`0 4px 24px rgba(16,44,38,.12)`): die Standardantwort auf Hover; auch die gescrollte Navigationsleiste trägt sie.
- **Angehoben** (`0 12px 48px rgba(16,44,38,.2)`): der stärkere Zustand, wenn ein Element wirklich vorn liegt — Portrait beim Hover über der Trainerkarte.
- **Creme-Schein** (`0 8px 24px rgba(247,231,206,.3)`): der Hover des primären Buttons auf grünem Grund. Kein Schatten im physikalischen Sinn, sondern ein Leuchten.
- **Dunkel weich / dunkel hart** (`0 8px 24px rgba(0,0,0,.15 / .2)`): nur unter hellen Buttons auf dunklem Grund, wo ein grüner Schatten unsichtbar bliebe.
- **Fokusring** (`0 0 0 3px rgba(16,44,38,.08)`): der einzige Schatten, der nichts anhebt.

### Named Rules

**The Flat-Until-Touched Rule.** Ruhezustand flach, Schatten erst bei Hover oder
Fokus. Prüftest: Screenshot ohne Mauszeiger — trägt darin etwas einen Schatten,
der nicht Navigation ist, gehört er weg.

**The Lift-Is-Small Rule.** Ein Element hebt sich um 1 bis 4 px, nie mehr:
−1 px beim vollbreiten Button, −2 px beim primären Button, −4 px bei der
Trainerkarte. Die Bewegung soll spürbar sein, nicht sichtbar springen.

## Shapes

Drei Formen, keine vierte:

- **Pille** (`100px`) für alles, was man anfasst oder was etwas etikettiert: Buttons, Badges, Jahres-Chips, Hero-Tag, Filter.
- **Karte** (`20px`) für alles, was etwas enthält: Eckdaten, Zitate, Bildrahmen, Medienflächen, Galeriekacheln.
- **Kreis** (`50%`) für Portraits, Icon-Kreise, Slider-Punkte und die 44-px-Slider-Buttons.

Eingabefelder sind die einzige Ausnahme mit **12 px** — weich genug, um zur
Familie zu gehören, eckig genug, um als Feld und nicht als Button gelesen zu
werden.

Ränder sind fast immer 1 px und aus einer Markentransparenz: `green-a12` bis
`green-a15` auf hellem Grund, `cream-a30` bis `cream-a35` auf grünem Grund.
Es gibt keine kräftigen, keine gestrichelten und keine doppelten Rahmen.

### Named Rules

**The Pill-or-Card Rule.** Wenn ein neues Element entsteht, ist die erste Frage
nicht „welcher Radius", sondern „ist es zum Anfassen oder zum Enthalten". Die
Antwort bestimmt die Form. Ein 8-px- oder 4-px-Radius existiert in diesem System
nicht.

## Components

### Buttons

- **Shape:** Pille (`100px`); der vollbreite Formular-Button ist die Ausnahme mit `12px`.
- **Primär:** Sandcreme-Fläche, tannengrüner Text, `14px 32px`, DM Sans 500 bei 0.95rem. Steht auf grünem Grund.
- **Hover:** Fläche wird reines Weiss, `translateY(-2px)`, Creme-Schein darunter, alles über `0.35s cubic-bezier(.4,0,.2,1)`.
- **Ghost:** transparent, Sandcreme-Text, 1 px Rand in `cream-a35`, `14px 24px`. Hover: Rand voll deckend, Fläche `cream-a08`. Der Ghost steht immer neben dem primären Button, nie allein.
- **Vollbreit:** tannengrüne Fläche, Sandcreme-Text, `12px` Radius, 1rem — der Absende-Button im Formular. Hover: `green-mid`, `translateY(-1px)`.
- **Ausgebucht:** Signalrot, kein Hover-Lift. Er lädt nicht ein, er informiert.

### Chips

- **Style:** weisse Fläche, tiefes Textgrün, 1 px Rand in `green-a15`, Pille, `min-height: 44px` — die Tap-Grösse ist Teil der Definition, nicht ein Zusatz.
- **Hover:** nur der Rand wird tannengrün, die Fläche bleibt.
- **Aktiv:** volle tannengrüne Fläche, Sandcreme-Text, Rand in derselben Farbe. Ein aktiver Chip ist eine Fläche, kein Umriss.
- **Badge (nicht interaktiv):** `green-a07`-Fläche, tannengrüner Text, `green-a12`-Rand, 0.82rem — dieselbe Silhouette wie ein Chip, aber ohne Hover, weil man ihn nicht anklicken kann.

### Cards / Containers

- **Corner Style:** `20px`.
- **Background:** Sandcreme auf weissem Grund; Galeriekacheln und Bildrahmen sind randlos beschnitten.
- **Shadow Strategy:** siehe Elevation — Ziel ist flach im Ruhezustand, Schatten bei Hover.
- **Border:** in der Regel keiner; wo einer nötig ist, 1 px `green-a12`.
- **Internal Padding:** 32 px (Eckdaten), 40 px (Zitate), 24 px in kompakten Kontexten.
- **Icon-Kreis:** 48 px, `green-a07`-Fläche, tannengrünes Icon — der Ersatz für ein Bild, nicht ein Schmuckelement.

### Inputs / Fields

- **Style:** weisse Fläche, `12px` Radius, 1 px **transparenter** Rand im Ruhezustand (damit der Fokus keinen Sprung erzeugt), Padding `10px 14px`.
- **Schriftgrösse 1rem — nicht kleiner.** Unter 16 px zoomt iOS Safari beim Fokus hinein. Das ist eine Regel, keine Vorliebe.
- **Label:** 0.85rem, DM Sans 500, `cream-a75` auf grünem Grund.
- **Focus:** Rand wird Sandcreme, `outline: none` nur weil der Rand die Rolle übernimmt.
- **Error:** Rand in Signalrot, darunter eine Fehlerzeile in 0.78rem. Der eingegebene Text wird bei einem Fehler nie geleert.
- **Checkbox:** `accent-color` Sandcreme, 18 px, oben ausgerichtet zum mehrzeiligen Einwilligungstext.

### Navigation

- **Zwei Varianten:** `hero` (Startseite) startet transparent über dem Hero und wird nach 60 px Scroll fest; `page` (Unterseiten) ist von Beginn an fest.
- **Fest heisst:** `green-a97`-Fläche, `backdrop-filter: blur(12px)`, Karten-Schatten, Polsterung schrumpft von 20 auf 12 px.
- **Links:** DM Sans 400, 0.88rem, `cream-a75`; aktiv und Hover in vollem Sandcreme. Kein Unterstrich, kein Rahmen — nur Deckkraft.
- **Wortmarke:** Syne, 1rem, 0.05em Tracking, Sandcreme.
- **Mobile (≤768 px):** Vollbild-Overlay in `green-a97`, Links zentriert bei 1.2rem, getrennt durch 1-px-Linien in `cream-a08`. Der Burger besteht aus drei 24 × 2-px-Balken und wird beim Öffnen zum Kreuz.
- **Tap-Ziele:** Logo, Burger und Fusszeilenlinks bekommen über ein unsichtbares `::before` eine 44-px-Trefferfläche, ohne die sichtbare Höhe zu verändern.

### Poster-Kopf (Signature)

Der Kopf jeder Unterseite ist die kleine Ausgabe des Hallenplakats: ein Foto
über die volle Breite bei **35 % Deckkraft**, darüber eine tannengrüne
Fläche bei **75 %**, darauf zentriert der Seitentitel in Sandcreme. Auf der
Startseite ist es dieselbe Konstruktion, nur mit einem Foto-Slider und einem
diagonalen Verlauf (85 % → 50 % → 70 %) statt einer flachen Fläche.

Fehlt das Foto, bleibt das Grün — und die Seite sieht trotzdem fertig aus. Genau
deshalb ist der Schleier keine Verzierung: er ist die Absicherung dafür, dass
jedes gelieferte Bild funktioniert und kein fehlendes Bild ein Loch hinterlässt.

### Bewegung

Eine Kurve für alles: `cubic-bezier(.4, 0, .2, 1)`, Standarddauer `0.35s`.
Auftritte gleiten aus 28 px nach oben, gestaffelt in fünf Stufen von 0.1 bis
0.7 s. Scroll-Enthüllungen blenden zusätzlich ein (0.6 s). Bild-Slider blenden
langsam über (1.5 s im Hero, 0.8 s im Karussell).

**The Legible-First-Frame Rule.** Der Hero-Text animiert nur seine Position, nie
seine Deckkraft — er ist ab dem ersten Frame lesbar. Alle Dauern und
Verzögerungen hängen an Motion-Tokens, die unter `prefers-reduced-motion` auf
`0.01ms` bzw. `0s` fallen; kein Inhalt darf hinter einer Animation verborgen
bleiben.

## Do's and Don'ts

### Do:

- **Do** jede Farbe, Schrift, jeden Radius, Schatten und Abstand aus `src/styles/tokens.css` ziehen. Braucht etwas einen neuen Wert, kommt er zuerst dort hinein, wird aus der Palette abgeleitet und zur Freigabe gemeldet.
- **Do** Transparenzen aus `--rgb-green-dark` / `--rgb-cream` komponieren statt aus Grau.
- **Do** jedem neuen Element zuerst die Frage stellen: Pille, Karte oder Kreis.
- **Do** Sektionen verschwinden lassen, wenn keine Daten da sind.
- **Do** Fotos immer unter einen Schleier oder in eine 20-px-Karte legen.
- **Do** interaktive Ziele auf mindestens 44 px bringen — notfalls über ein unsichtbares `::before`, ohne die Optik zu verändern.
- **Do** Eingabefelder bei mindestens 1rem halten.
- **Do** neue Bewegung an die Motion-Tokens hängen, damit `prefers-reduced-motion` automatisch greift.

### Don't:

- **Don't** eine dritte Hintergrundfamilie einführen. Grün oder hell — nichts dazwischen.
- **Don't** das konturierte Wort mehr als einmal pro Seite verwenden.
- **Don't** Rot für etwas anderes als Fehler oder „Ausgebucht" benutzen.
- **Don't** einen Radius zwischen 12 und 20 px erfinden, und keinen unter 12 px.
- **Don't** die Seite wie ein kommerzielles Camp-Angebot aussehen lassen: keine Rabatt-Sticker, keine Countdown-Uhren, keine „nur noch 3 Plätze"-Dringlichkeit.
- **Don't** Tech-Startup-Vokabular übernehmen: keine Gradient-Blobs, kein Glasmorphismus, keine Neon-Akzente.
- **Don't** die Seite verkindlichen: keine Comic-Schriften, keine Regenbogenfarben, kein Maskottchen — die Kinder schauen, die Eltern entscheiden.
- **Don't** Inhalt hinter einer Einblend-Animation verstecken; Position darf animieren, Lesbarkeit nie.
- **Don't** ein Stockfoto oder eine erfundene Person einsetzen, wenn ein Bild fehlt. Der grüne Schleier trägt die Fläche allein.
