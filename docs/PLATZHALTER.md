# PLATZHALTER — offene Bilder und Inhalte

**Stand:** 28. Juli 2026 · Branch `feat/relaunch`

Laufende Liste aller Stellen, an denen noch ein echtes Bild oder ein echter Inhalt fehlt.

Ab **Phase 3** wird diese Liste zur Datenquelle: jeder Eintrag wird ein Feld in
`src/content/registry.ts` und erscheint im Admin unter „Inhalte" mit dem Zustand
**„Platzhalter — noch kein Bild"**. Das Dashboard des Admins zeigt dann eine Übersicht
aller offenen Platzhalter, damit auf einen Blick sichtbar ist, was noch fehlt.

Bis dahin ist dies die manuell gepflegte Fassung.

---

## Bilder

| #       | Wo                                                                          | Aktueller Zustand                                                                                                                           | Was gebraucht wird                                                                                                             | Ab Phase ersetzbar |
| ------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| **B1**  | **Favicon / Browser-Tab**                                                   | ✅ Platzhalter erstellt: `Bilder/favicon.svg` — dunkelgrünes Quadrat mit cremefarbener Marke, ausschliesslich aus Tokens                    | Echtes Logo als SVG, oder eine Wortmarke in Syne, sobald die Schrift ab Phase 1 selbst gehostet ist                            | 3                  |
| **B2**  | **App-Icons** (iOS-Startbildschirm, Android)                                | ❌ existieren nicht                                                                                                                         | PNG in 180 × 180 und 512 × 512, aus demselben Motiv wie B1                                                                     | 7                  |
| **B3**  | **Open-Graph-Bild** (Vorschau beim Teilen in WhatsApp, Instagram, Facebook) | ❌ existiert nicht — beim Teilen erscheint nur der nackte Link ohne Vorschaubild                                                            | 1200 × 630. Vorschlag: dunkelgrün mit cremefarbenem Schriftzug „Improve your skills" in Syne, ab Phase 7 automatisch generiert | 7                  |
| **B4**  | **CTA-Banner Startseite** (`index.html:104`, `Bilder/cta-bg.jpg`)           | ⚠️ referenziert, existiert nicht → Banner bleibt einfarbig dunkelgrün                                                                       | Querformat, wirkt als Hintergrund mit 25 % Deckkraft hinter „Bereit für den nächsten Schritt?"                                 | 3                  |
| **B5**  | **Über-uns-Kopfbild** (`ueber.html:33`, `Bilder/ueber-header.jpg`)          | ⚠️ referenziert, existiert nicht → Kopfbereich bleibt einfarbig dunkelgrün                                                                  | Querformat, Hintergrund mit 35 % Deckkraft hinter „Über uns."                                                                  | 3                  |
| **B6**  | **Hero-Slider Startseite** (3 Bilder)                                       | ⚠️ zeigt allgemeine Spielfotos. Der Kommentar im Code (`index.html:35`) sagt ausdrücklich, hier sollten Fotos der drei Trainer:innen stehen | Je ein Bild von Vanessa, Pascal und Claudio, Querformat, Gesicht im oberen Drittel (`object-position: center top`)             | 3                  |
| **B7**  | **Kontaktseite**                                                            | ❌ kein Bild vorgesehen                                                                                                                     | Bild neben dem Formular (Briefing Phase 6.4)                                                                                   | 6                  |
| **B8**  | **Anmeldeseite**                                                            | ❌ kein Bild vorgesehen                                                                                                                     | Bild auf der Anmeldeseite (Briefing Phase 6.4)                                                                                 | 6                  |
| **B9**  | **Feature-Boxen Über uns** (3 ×)                                            | ✅ Admin-Feld existiert (Phase 6) — ohne hochgeladenes Bild bleibt es beim Emoji 🎯 👥 🏆, kein Bruch                                       | Optional Bilder statt Emoji, im Admin unter Inhalte → Über uns → Unser Ansatz                                                  | 6                  |
| **B10** | **Banner zwischen Sektionen**                                               | ✅ Admin-Feld existiert (Phase 6), zwischen Team und Zitaten — ohne Bild erscheint dort schlicht nichts, kein leerer Balken                | Vollbreites Bild, im Admin unter Inhalte → Über uns → Banner                                                                   | 6                  |
| **B11** | **„Eindrücke"-Bilderreihe Startseite** (6 Bilder)                            | ✅ Admin-Felder existieren (UI-Pass Aug 2026) — ohne mindestens ein Bild erscheint die ganze Sektion nicht, kein leerer Bereich            | Bis zu 6 Trainingsfotos, hochformatig wirken am besten (3:4), im Admin unter Inhalte → Startseite → Eindrücke                  | UI-Pass Aug 2026   |

---

## Texte und Daten

| #       | Wo                                                          | Aktueller Zustand                                                                                                                                                                                                                                                                         | Was gebraucht wird                                                                                      |
| ------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **T1**  | Impressum, „Verantwortliche Personen" (`impressum.html:41`) | ⚠️ nur Claudio Schmid, Kommentar „Bitte Adressen ergänzen"                                                                                                                                                                                                                                | Adressen von Pascal und Vanessa, oder Entscheidung, dass eine Kontaktadresse genügt                     |
| **T2**  | Impressum, „Kontakt" (`impressum.html:47`)                  | ⚠️ Kommentar „E-Mail und Telefon ergänzen". Zusätzlich zeigt der Linktext `info@improveyourskills.ch`, das Ziel ist aber `claudio.schmid@active.ch`                                                                                                                                       | Eine verbindliche Kontaktadresse, konsistent in Text und Link                                           |
| **T3**  | Impressum, Adresse                                          | ⚠️ `4656 Starrkich-Wil` — vermutlich Tippfehler                                                                                                                                                                                                                                           | Vermutlich **Starrkirch-Wil** — bitte bestätigen                                                        |
| **T4**  | Impressum, Datum                                            | ⚠️ `4. Juli 2026`, überall sonst `5. Juli 2026`                                                                                                                                                                                                                                           | Korrektes Datum                                                                                         |
| **T5**  | Impressum, Fotorechte                                       | ⚠️ verspricht, Fotos **nicht** zu veröffentlichen und nach dem Anlass zu löschen. **Einwilligungslage geklärt (28.07.2026):** bei jeder Anmeldung eingeholt; von Kindern ohne Foto-Erlaubnis wurden gar keine Fotos gemacht → Galerie ist gedeckt. Nur der Text widerspricht der Realität | Neuen Text in Phase 7, der die kuratierte Galerie und den OneDrive-Versand an Eltern korrekt beschreibt |
| **T6**  | Impressum, Payrexx                                          | ⚠️ nennt Payrexx als Zahlungsdienstleister, auf der Website nicht vorhanden                                                                                                                                                                                                               | Entfernen oder bestätigen                                                                               |
| **T7**  | Datenschutzerklärung                                        | ❌ existiert nicht                                                                                                                                                                                                                                                                        | Entwurf kommt in Phase 7, muss von dir geprüft werden                                                   |
| **T8**  | Zitate (`testimonials`)                                     | ✅ Anzeige auf Über uns fertig (Phase 6) — Abschnitt bleibt unsichtbar, bis mindestens ein Zitat erfasst ist                                                                                                                                                                              | Echte Aussagen von Teilnehmenden oder Eltern, im Admin unter „Zitate & Zahlen" erfassen                 |
| **T9**  | Zahlen (`stats`)                                            | ✅ Anzeige auf Über uns fertig (Phase 6, zählt beim Sichtbarwerden hoch) — Band bleibt unsichtbar, bis mindestens eine Zahl erfasst ist                                                                                                                                                   | z. B. Anzahl Teilnehmende, Trainingstage, Nationalspieler:innen, im Admin unter „Zitate & Zahlen" erfassen |
| **T10** | Übersetzungen EN / FR                                       | ❌ existieren nicht                                                                                                                                                                                                                                                                       | Nach Phase 1 liegen alle Texte in `messages/de.json`; EN und FR sind zunächst Kopien des Deutschen      |

---

## Erledigt

| #   | Was                                                                                                                                                                                                                                                        | Wann       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| ✅  | **`Bilder/logo.png`** — auf allen 6 Seiten als Favicon **und** Navigations-Logo referenziert, existierte aber nie im Repository. Tote Verweise entfernt, Navigation auf ein echtes Textlogo umgestellt, Favicon-Platzhalter `Bilder/favicon.svg` erstellt. | 28.07.2026 |

---

## Hinweis zum Zusammenspiel mit Phase 3

Beim Aufbau der Registry gilt: **jedes Bild auf der Website wird ein Feld im Admin** — auch
die, die heute schon ein echtes Bild haben. Der Unterschied ist nur, ob das Feld gefüllt
ist oder den Platzhalter-Zustand zeigt. So kannst du später jedes Bild austauschen, ohne
dass jemand Code anfassen muss, und diese Liste wird überflüssig.
