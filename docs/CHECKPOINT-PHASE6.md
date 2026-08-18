# Checkpoint — Phase 6 (Über uns aufwerten)

**Stand:** 11. August 2026 · **Branch:** `feat/relaunch`

## Was fertig ist

- **Zahlenband** direkt unter dem Kopfbereich von „Über uns": grosse Zahlen in
  Syne, zählen beim Sichtbarwerden von 0 hoch (z. B. „500+"), respektiert
  `prefers-reduced-motion` (zeigt dann sofort die Endzahl, keine Animation).
  Bleibt komplett unsichtbar, solange keine Zahl im Admin erfasst ist — kein
  leeres Band, keine erfundenen Platzhalterzahlen.
- **Zitate-Abschnitt**, in derselben Kartenoptik wie der Rest der Seite
  (gleiche Rundung, gleicher Schatten). Ebenfalls unsichtbar ohne echten
  Inhalt.
- **Grössere, ruhigere Trainerkarten:** Fotos 25 % grösser, sanfter Schatten
  beim Hover statt nur der bisherigen Verschiebung, und die
  Nationalteam-Zeile (z. B. „Nationalspieler · SVWE …") ist jetzt deutlich
  kräftiger gesetzt (dunkelgrün, mittlere statt dünne Schrift) — das ist ein
  Vertrauens-Signal und sollte nicht mehr wie Kleingedrucktes wirken.
- **Drei neue, optionale Bildfelder** für die „Unser Ansatz"-Boxen (ersetzen
  bei Bedarf die Emoji 🎯 👥 🏆) und ein **breites Banner-Bild** zwischen Team
  und Zitaten — beide nach dem gleichen Muster wie jedes andere Bild auf der
  Seite: Admin-Feld mit Platzhalter-Zustand, kein erfundenes Stockfoto.
- **Die bereits in Phase 0 getroffene Entscheidung zur Start-Animation
  endlich umgesetzt:** Das Briefing verlangt „keine Animation im ersten
  Viewport der Startseite", du hattest im Audit (Frage 3) schon zugestimmt,
  die bestehende Einblendung zu behalten, aber so umzubauen, dass der Text
  sofort lesbar ist. Der Hero-Text auf der Startseite startet jetzt nicht
  mehr unsichtbar (`opacity: 0`) und blendet ein, sondern ist von der ersten
  Sekunde an voll lesbar und rutscht nur noch leicht in Position. Betrifft
  ausschliesslich den Homepage-Hero (`.animate-up` wird sonst nirgends
  verwendet) — alle anderen Seiten unverändert.

## Ein Fund unterwegs (behoben)

Beim Testen des Zahlenbands mit echten Testdaten zeigte die Zählanimation im
lokalen Entwicklungsmodus manchmal falsche, eingefrorene Werte (z. B. „-2+"
statt „500+"). Ursache: die Aufräum-Funktion des Zähl-Effekts hat zwar den
Beobachter (IntersectionObserver) sauber abgemeldet, aber eine bereits
laufende Zähl-Animation (`requestAnimationFrame`) nicht gestoppt — React
startet Komponenten im Entwicklungsmodus absichtlich doppelt, um genau solche
Fehler aufzudecken. **Wichtig:** Das eigentliche Produktions-Bauwerk (das,
was auf Vercel läuft) war davon nie betroffen — ich habe das gezielt
gegengeprüft, bevor ich den Fund als „nur kosmetisch im Entwicklungsmodus"
eingestuft habe. Trotzdem behoben, weil eine nicht gestoppte Animation ein
echter kleiner Fehler ist, unabhängig davon, ob er gerade sichtbar wird.

## Bewusste Annahmen

- **Zwei neue Design-Tokens** in `tokens.css`, wie in den Grundregeln
  verlangt hier gemeldet: `--size-avatar-lg` (200px, für die grösseren
  Trainerfotos — die bisherige `--size-avatar` bleibt für die kompaktere
  Foto-Vorschau im Admin unverändert) und `--width-team-bio-lg` (260px,
  passend zur jetzt grösseren Nationalteam-Zeile). Beide aus der bestehenden
  Skala abgeleitet, keine neue Farbe/Schrift.
- **Zahlenband ohne eigene Überschrift** — sitzt direkt unter dem
  Kopfbereich, der schon Badge/Titel/Untertitel hat; eine weitere
  Überschrift direkt darüber wäre redundant gewesen.
- **Banner-Platzierung:** zwischen Team und Zitaten. Im Briefing nicht
  genauer festgelegt („zwischen Sektionen") — dort schien es mir der
  natürlichste Bruch im Lesefluss.

## Was du jetzt tun kannst (kein Muss, aber der Sinn der Phase)

Zahlenband, Zitate-Abschnitt, die drei Feature-Bilder und das Banner sind
alle **bereits live im Code**, aber bewusst unsichtbar bzw. beim Emoji
geblieben, bis du echte Inhalte einträgst — genau wie jedes andere Bildfeld
auf dieser Seite. Alles davon trägst du im Admin ein:

- **Zitate & Zahlen** (bestehender Bereich, seit Phase 3): mindestens eine
  Zahl und ein Zitat erfassen, dann erscheinen die beiden neuen Abschnitte
  automatisch.
- **Inhalte → Über uns → Unser Ansatz:** optional je ein Bild für die drei
  Feature-Boxen.
- **Inhalte → Über uns → Banner:** optional ein breites Bild.

## Was ich nicht selbst verifizieren konnte

Wie bei jeder Admin-Seite bisher fehlt mir ein eigener Zugang, um die vier
neuen Bildfelder tatsächlich im „Inhalte"-Editor durchzuklicken. Der
Mechanismus dahinter (Registry-Eintrag → Admin-Formularfeld → Bild-Upload)
ist aber exakt derselbe, der für jedes andere Bild auf der Seite bereits seit
Phase 3 nachweislich funktioniert — hier kommt nichts Neues hinzu, nur vier
weitere Einträge desselben Musters.

Alles andere habe ich direkt geprüft: Zahlenband und Zitate mit echten
Testdaten (danach wieder gelöscht, damit dein erster Blick nicht mit
Testdaten von mir startet), leerer Zustand bei null Einträgen, kein
horizontales Scrollen bei 375/1280 px, sauberer Produktions-Build.

## Nächster Schritt

Damit sind alle inhaltlichen Phasen (4, 5, 6) abgeschlossen. Es bleibt nur
noch **Phase 7** (Performance, SEO, Recht, Livegang) — die ohnehin als
Abschluss vorgesehen war. Zwei kleinere, separat vorgemerkte Aufgaben sind
weiterhin offen und unabhängig davon jederzeit angehbar: task_b7dca482
(Mobil-Umbruch auf der Anmeldung-Seite, aus Phase 4) und task_f3f48738
(Anmeldung-Kopftext berücksichtigt den offen/geschlossen-Zustand noch nicht,
aus Phase 5).
