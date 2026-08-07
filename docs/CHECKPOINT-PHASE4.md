# Checkpoint — Phase 4 (Galerie)

**Stand:** 7. August 2026 · **Branch:** `feat/relaunch`

## Was fertig ist

- **Neuer privater Storage-Bucket `gallery`** (Migration
  `20260807091919_gallery_bucket.sql`) — anders als der `media`-Bucket aus
  Phase 3 hat er **keine** öffentliche Lese-Regel. Nur Admins dürfen direkt
  darauf zugreifen; Besucher:innen sehen Bilder ausschliesslich über die
  eigene Route (nächster Punkt). Die Tabelle `gallery_photos` selbst
  existiert schon seit Phase 2 und war unverändert richtig eingerichtet.
- **Upload komplett im Browser:** EXIF-Datum lesen (`exifr`) → Datei-Datum →
  aktuelles Ausgabejahr als Kaskade, pro Foto und im Block überschreibbar.
  Drei WebP-Varianten (480/72 %, 1200/78 %, 2000/80 % – exakt wie im
  Briefing) plus ein winziger Blur-Platzhalter, alles aus **einem** Bild-
  Decode statt vier. EXIF (inkl. GPS) ist nach dem Neu-Encodieren komplett
  weg, das ist eine Eigenschaft von Canvas, kein Zusatzschritt.
- **`/api/foto/[id]/[size]`** ist die einzige Art, wie ein Bild beim
  Besucher landet. Sie prüft zuerst über den öffentlichen (anon)
  Datenbank-Zugriff, ob das Foto existiert und nicht `hidden` ist (das ist
  über RLS erzwungen, nicht nur eine Höflichkeit im Code), und liest die
  Bild-Bytes erst danach mit dem **Service-Role-Schlüssel** aus dem privaten
  Bucket. Das ist die erste Stelle im Projekt, die diesen Schlüssel
  tatsächlich braucht — siehe „Was du manuell tun musst".
- **Admin unter „Galerie":** Fotos oder ganze Ordner per Drag-and-drop (oder
  Dateiauswahl/Ordnerauswahl als Knopf), Jahr pro Foto oder im Block
  überschreibbar, maximal 3 Fotos gleichzeitig in Bearbeitung (schont
  schwächere Laptops), Fortschrittsbalken pro Foto, automatischer Rückzug
  hochgeladener Dateien, wenn das Speichern in der Datenbank fehlschlägt.
  **Nach dem Hochladen zeigt die Oberfläche selbst eine Zusammenfassung**
  (Anzahl, Grösse, Dauer) — das deckt die im Briefing verlangte Checkpoint-
  Angabe „Zeit, Dateigrössen" direkt ab, du musst nichts selbst stoppen.
  Danach: Fotos gruppiert nach Jahr, Ziehen zum Neuordnen (nur innerhalb
  desselben Jahres — ein Verschieben in ein anderes Jahr ist technisch gar
  nicht möglich), Verbergen/Anzeigen, Löschen mit Bestätigung (zeigt eine
  Vorschau des Fotos, weil Fotos anders als Team-Karten keinen Namen haben).
- **Öffentliche Galerie auf `/impressionen`:** Jahres-Filter als Pills
  („Alle" + Jahre mit Fotos), Standard ist das neueste Jahr, in der URL als
  `?jahr=` gespiegelt — rein clientseitig, ohne Serveranfrage beim Umschalten.
  Masonry-Raster über CSS-Spalten, jede Kachel reserviert ihre Höhe über das
  gespeicherte Seitenverhältnis (kein Ruckeln beim Nachladen). Vollbild-
  Lightbox mit Pfeiltasten, Esc, Wischen, Vorladen des nächsten Bildes,
  respektiert reduzierte Bewegung, ohne Bildunterschriften.
- **Datenschutz-Layer wie im Briefing gefordert:** `<meta name="robots"
  content="noimageindex">` auf der Seite, `X-Robots-Tag: noindex,
  noimageindex, nofollow` auf jeder Bildantwort, `/api/foto/` zusätzlich in
  `robots.txt` gesperrt. Rechtsklick/Ziehen zum Speichern ist auf den Bildern
  unterbunden — ausdrücklich nur als Reibung markiert, kein echter Schutz
  (das steht auch im Code-Kommentar, damit es niemand später missversteht).
- **10 neue Vitest-Tests** (jetzt 47 insgesamt) für Pfad-Aufbau,
  Jahres-Kaskade, die Nebenläufigkeits-Begrenzung beim Hochladen und die
  Jahres-Ermittlung aus den Fotos.

## Was du manuell tun musst

1. **Die Migration einspielen — das konnte ich diesmal nicht selbst.** Die
   Sandbox, in der ich arbeite, kommt nicht auf Port 5432 raus (den
   direkten Postgres-Port, den `supabase db push` braucht); die normale
   Web-Verbindung über HTTPS funktioniert einwandfrei, nur dieser eine Port
   ist blockiert. Zwei Wege, einer reicht:
   - **Einfachster Weg:** Supabase-Dashboard → SQL Editor → Inhalt von
     `supabase/migrations/20260807091919_gallery_bucket.sql` einfügen und
     ausführen.
   - **Oder:** `supabase db push` von deinem eigenen Rechner aus (dort ist
     Port 5432 vermutlich nicht blockiert).
   Ohne diesen Schritt gibt es keinen `gallery`-Bucket, und jeder Upload-
   Versuch im Admin schlägt fehl.
2. **`SUPABASE_SERVICE_ROLE_KEY` in Vercel prüfen.** Lokal steht er in
   `.env.local`, aber ob er auch in Vercel (Production **und** Preview)
   hinterlegt ist, weiss ich nicht — bisher hat ihn keine Phase gebraucht.
   Ohne ihn liefert `/api/foto/…` einen Serverfehler statt eines Bildes.
   Settings → Environment Variables → Wert aus `.env.local` übernehmen,
   „Server-side" (kein `NEXT_PUBLIC_`-Präfix).
3. **Checkpoint-Vorgabe des Briefings: ~30 gemischte Fotos hochladen.** Das
   kann nur du tun — ich habe weder einen Admin-Zugang noch echte
   Testfotos. Unter „Galerie" hochladen, danach zeigt die Oberfläche selbst
   Anzahl/Grösse/Dauer (Screenshot davon reicht mir als Nachweis). Danach
   auf `/impressionen` anschauen und wenn möglich ein Lighthouse-Audit
   fahren (Chrome DevTools → Lighthouse).

## Ein Fund unterwegs (behoben)

Beim mobilen Test von `/impressionen` (375 px) ist mir aufgefallen, dass der
Seitentitel „Impressionen." rechts abgeschnitten wurde. Grund: Die alte
`style.css` hatte eine Mobil-Regel für `.page-header-title` (kleinere
Schrift + Zeilenumbruch bei langen Wörtern unter 480 px), die beim Portieren
in Phase 1 schlicht übersehen wurde — vermutlich weil die damals geprüften
Titel („Kontakt.", „Über uns.") kurz genug waren, um nicht aufzufallen.
„Impressionen." ist das erste Beispiel, das lang genug ist, um die Lücke
sichtbar zu machen. Ich habe die fehlende Regel 1:1 aus der alten CSS
nachgetragen (`src/app/globals.css`) und an 375 px auf allen vier
betroffenen Seiten (Impressionen, Kontakt, Über uns, Startseite) geprüft:
kein Abschneiden, kein horizontaler Scroll mehr.

**Zweiter Fund, bewusst NICHT mit behoben:** Auf `/anmeldung` (geschlossener
Zustand) läuft die Überschrift „Anmeldungen & Infos folgen im {Jahr}." bei
375 px ebenfalls über den Rand. Anders als beim Titel oben gibt es dafür
**keine** Regel in der alten `style.css` zum Nachtragen — ich habe es direkt
verglichen, der Fehler steckt genauso im Original. Das ist also kein
Phase-1-Fehler, sondern ein echter, bisher unentdeckter Bug der
ursprünglichen Seite. Weil er eine andere Seite betrifft, die mit der
Galerie nichts zu tun hat, und eine neue Gestaltungsentscheidung bräuchte
(nicht nur eine Kopie einer bestehenden Regel), habe ich ihn **nicht** in
diese Phase gezogen, sondern als eigene Aufgabe vorgemerkt — du siehst dazu
einen separaten Vorschlag.

## Bewusste Abweichungen vom Briefing

- **Der OneDrive-Knopf ist von `/impressionen` verschwunden.** Das Briefing
  sagt ausdrücklich, die neue Galerie „ersetzt" den externen OneDrive-Link.
  Der Link an die Eltern für Fotos in voller Auflösung bleibt bestehen (läuft
  weiter über eure Nachrichten, wie besprochen) — er taucht nur nicht mehr
  als Knopf auf der Seite auf. Ein optionales „volle Auflösung? Hier"-Feld
  pro Jahr war im Briefing als Idee genannt, aber nur als „überleg dir das"
  — das habe ich nicht gebaut, um die Phase nicht unnötig zu vergrössern;
  sag Bescheid, wenn du es doch willst, ist ein kleiner Zusatz.
- **Kein nachträgliches Ändern des Jahres** nach dem Hochladen (nur vorher,
  beim Hochladen selbst). Das Briefing nennt für die Verwaltung nach dem
  Upload nur „neu anordnen, verbergen, löschen" — keine Jahres-Korrektur.
  Falls ein Foto im falschen Jahr landet, aktuell: löschen und mit
  richtigem Jahr neu hochladen. Sag Bescheid, wenn dir das zu umständlich
  ist, das nachzurüsten ist klein.
- **Neuer Design-Token:** `--z-lightbox: 1001` in `tokens.css` (ein Schritt
  über dem bisher höchsten Wert `--z-burger`). Keine neue Farbe/Schrift/
  Radius — nur damit die Lightbox garantiert über allem liegt, auch dem
  Menü-Button. Flagge das hier, wie in den Grundregeln vereinbart.

## Was ich nicht selbst verifizieren konnte

- **Die Migration ist noch nicht angewendet** (siehe oben) — ich kann sie
  syntaktisch geprüft haben (mit einem SQL-Parser im Scratchpad), aber nicht
  live gegen eure Datenbank testen, solange Port 5432 aus meiner Umgebung
  blockiert ist.
- **Der echte Upload-Weg im Browser** (Login → Dateien ziehen → Fortschritt
  → Zusammenfassung → Foto erscheint auf `/impressionen`) — wie schon in
  Phase 3 fehlt mir dafür ein Admin-Zugang. Was ich geprüft habe: alle
  Bausteine einzeln (Route liefert sauber 404 für unbekannte/versteckte
  Fotos, `/admin/galerie` leitet ohne Login korrekt auf die Anmeldung um,
  die öffentliche Seite zeigt den korrekten Leer-Zustand), Build/Typecheck/
  Lint/Tests sind alle grün.
- **Lighthouse-Werte mit echten Fotos** — ohne Bilder in der Datenbank nicht
  aussagekräftig zu messen.

## Nächster Schritt

Laut Plan sind **Phase 4 (Galerie), 5 (Kontaktformular) und 6 (Über uns)**
voneinander unabhängig — nur Phase 3 muss stehen, was sie tut. Du kannst
also, sobald der Bucket eingerichtet ist und der Upload-Test geklappt hat,
frei wählen, welche der drei als Nächstes drankommt.
