# Checkpoint — Phase 5 (Kontaktformular)

**Stand:** 10. August 2026 · **Branch:** `feat/relaunch`

## Was fertig ist

- **Der `mailto:`-Knopf auf `/kontakt` ist ein echtes Formular** geworden:
  Vorname, Name, E-Mail, Nachricht, Pflicht-Einwilligung mit Link zur (als
  Entwurf markierten) Datenschutzerklärung. Validierung serverseitig mit Zod,
  Fehler erscheinen pro Feld in der Sprache der Website, **die eingegebenen
  Werte bleiben bei einem Fehler erhalten** — nichts wird weggelöscht.
- **Drei Schutzschichten gegen Spam**, wie im Briefing verlangt:
  - **Honeypot** — ein für echte Besucher:innen unsichtbares Feld. Füllt es
    jemand aus (nur Bots tun das), wirkt das Formular nach aussen wie
    erfolgreich abgeschickt, es wird aber nichts gespeichert oder verschickt.
  - **Cloudflare Turnstile**, serverseitig verifiziert (nicht nur im
    Browser geprüft — das wäre wirkungslos).
  - **Rate-Limit pro IP**: höchstens 3 Nachrichten pro Stunde. Die IP wird
    dafür **nie im Klartext gespeichert**, nur als Einweg-Hash (mit Salt) —
    das Formular selbst dient als Zähler, keine zusätzliche Infrastruktur
    nötig.
- **Nachricht wird immer gespeichert, auch wenn der Mailversand scheitert**
  (z. B. weil Resend noch nicht eingerichtet ist) — die Besucherin sieht
  trotzdem „Danke für deine Nachricht!", der Fehler landet nur im Admin
  (`email_delivery_status`).
- **Zwei E-Mails pro Nachricht** (sobald Resend eingerichtet ist, siehe unten):
  eine Benachrichtigung an Pascal mit der Absenderin als Reply-To, und eine
  automatische Bestätigung an die Besucherin — beide im Markendesign (dunkles
  Grün, Cremeweiss), in der Sprache, in der das Formular ausgefüllt wurde.
- **Admin → „Nachrichten"** ist kein „Bald"-Eintrag mehr: Posteingang, neueste
  zuerst, ungelesene fett mit Zähler in der Seitenleiste, antippen markiert
  als gelesen (und lässt sich manuell wieder auf ungelesen zurückstellen),
  „Antworten" öffnet einen vorbereiteten Mailto-Link, Löschen fragt vorher
  nach und nennt den Namen der Absenderin.
- **10 neue Vitest-Tests** (jetzt 73 insgesamt) für die Formularvalidierung,
  die IP-Hash-Funktion und die E-Mail-Vorlagen — insbesondere, dass eine
  böswillige Nachricht wie `<img src=x onerror=...>` beim Rendern der E-Mail
  sauber escaped wird und keinen Code einschleusen kann.

## Ein Fund unterwegs (behoben)

Beim mobilen Test von `/kontakt` ist mir aufgefallen, dass die Seite plötzlich
horizontal scrollte — neu, kam erst mit dem Formular dazu. Ursache: Cloudflares
Turnstile-Baustein hat standardmässig eine **feste Breite von 300 Pixeln**,
die nicht mitschrumpft. Auf schmalen Handys war die Karte links davon (mit
dem Formular) schmaler als das — das hat sowohl diese Karte als auch,
über einen CSS-Grid-Nebeneffekt, **die Kartenbox rechts** unsichtbar in die
Breite gezogen. Behoben mit drei kleinen, zusammenhängenden Anpassungen: dem
Grid ein `minmax(0, …)` statt eines nackten `1fr` gegeben (verhindert, dass
Inhalt eine Spalte aufbläht), Turnstile in den „flexiblen" statt dem festen
Grössenmodus geschaltet, und dem Baustein selbst vorsichtshalber
`overflow: hidden` mitgegeben (Cloudflares interne Iframe-Technik hält sich
nicht immer exakt an die eigene Breitenangabe). Geprüft bei 375/768/1280 px,
kein horizontales Scrollen mehr.

## Eine Randkorrektur (im selben Aufwasch erledigt)

Beim Klären, ob diese Phase auch ein echtes **Anmeldeformular** umfassen
sollte (ein Kommentar im Code deutete das an) — du hast entschieden: nein,
nur das Kontaktformular. Damit war aber ein Satz auf der offenen Anmeldung-Seite
("Das Formular wird in wenigen Tagen hier aufgeschaltet…") schlicht falsch
geworden, weil kein Formular mehr kommt. Ich habe den Text durch einen
korrekten ersetzt (verweist auf das Kontaktformular) und dabei gleich in die
normale Übersetzungsstruktur überführt, wie der Rest der Seite es schon
macht. Separat aufgefallen und **nicht** mitgezogen: der Titel/Untertitel
dieser Seite sagt im geöffneten Zustand weiterhin „geschlossen" — das ist ein
eigenes, kleines Thema mit eigenem Formulierungsbedarf und deshalb als
separater Vorschlag vorgemerkt, nicht Teil dieser Phase.

## Was du manuell tun musst

**→ Ausführliche Schritt-für-Schritt-Anleitung: [`docs/RESEND.md`](RESEND.md)**

Kurzfassung:

1. Resend-Konto anlegen, API-Key in Vercel als `RESEND_API_KEY` eintragen.
2. Domain bei Resend hinzufügen, die drei angezeigten DNS-Einträge (SPF,
   DKIM, DMARC) bei Hostpoint eintragen, warten bis „Verified", dann
   `RESEND_FROM_EMAIL` in Vercel setzen. **Bis dahin funktioniert alles
   andere bereits** — nur der Mailversand bleibt aus (Nachrichten landen
   trotzdem gespeichert im Admin).
3. Cloudflare-Turnstile-Schlüsselpaar erzeugen, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   und `TURNSTILE_SECRET_KEY` in Vercel eintragen. **Ohne diese zwei Werte
   funktioniert das Formular nicht** — anders als Resend ist das kein
   optionaler Feinschliff.
4. Einmal `openssl rand -hex 32` ausführen, Ergebnis als
   `CONTACT_IP_HASH_SALT` in Vercel eintragen.
5. Danach: eine echte Testnachricht über `/kontakt` schicken, im Admin unter
   „Nachrichten" prüfen, dass sie ankommt und die Mail bei Pascal eintrifft.

Google Maps war im Briefing als offene Frage vorgesehen — ist aber bereits
seit Phase 1 als Klick-zum-Laden-Knopf umgesetzt, hier ist nichts mehr zu tun.

## Was ich nicht selbst verifizieren konnte

- **Den echten Mailversand** — ohne Resend-Zugangsdaten kann ich nur den
  Fehlerfall testen (siehe unten), nicht den Erfolgsfall.
- **Die Admin-Oberfläche „Nachrichten" im Browser** — wie bei jeder
  Admin-Seite bisher fehlt mir ein eigener Zugang. Ich habe stattdessen die
  Datenzugriffe direkt geprüft (siehe unten) und den Code eng an den
  bestehenden, bereits geprüften Editoren (Team, Karussell) ausgerichtet.

**Was ich stattdessen geprüft habe**, jeweils Ende-zu-Ende im Browser gegen
eure echte (Test-)Datenbank, mit Cloudflares offiziellen Test-Schlüsseln
(fest codiert für „besteht immer", niemals eure echten Schlüssel):

- Leeres Formular abschicken → alle fünf Pflichtfelder melden sich korrekt.
- Vollständiges, gültiges Formular → Nachricht gespeichert, Erfolgsmeldung
  angezeigt, `email_delivery_status` korrekt auf `failed` gesetzt (weil kein
  Resend-Schlüssel lokal vorhanden ist) — genau das vom Briefing verlangte
  Verhalten.
- Honeypot-Feld ausgefüllt (simulierter Bot) → Erfolgsmeldung angezeigt,
  aber **nichts** in der Datenbank gelandet.
- Viertes Formular innerhalb einer Stunde → korrekt mit der
  Rate-Limit-Meldung abgewiesen.
- Alle Testeinträge danach wieder gelöscht, damit dein erster echter Blick in
  „Nachrichten" nicht mit Testdaten von mir startet.

## Bewusste Annahmen

- **Rate-Limit: 3 Nachrichten pro Stunde pro IP.** Im Briefing nicht
  beziffert — grosszügig genug für jemanden, der z. B. einen Tippfehler
  korrigieren will, eng genug gegen eine Flut. Als benannte Konstante im Code
  (`RATE_LIMIT_MAX_PER_WINDOW`), falls du das anpassen möchtest.
- **Absender-Fallback:** Ohne gesetztes `RESEND_FROM_EMAIL` läuft alles über
  Resends eigene Testadresse statt einer eigenen `@improveyourskills.ch`-
  Adresse. Bewusst so gebaut, damit ein fehlender DNS-Schritt nicht die ganze
  Funktion blockiert.
- **`/datenschutz` ist ein bewusst minimaler Entwurf**, nur damit die
  Einwilligungs-Checkbox nicht auf eine tote Seite verweist. Beschreibt nur,
  was diese Phase tatsächlich einführt (Formular-Datenfluss), ausdrücklich
  als Entwurf markiert, `noindex`, nirgends verlinkt ausser vom Formular
  selbst. Die vollständige, rechtlich geprüfte Fassung ist weiterhin
  Phase 7 (siehe `docs/PLAN.md`).

## Nächster Schritt

Laut Plan ist von den ursprünglich unabhängigen Phasen 4/5/6 jetzt nur noch
**Phase 6 (Über uns aufwerten)** offen — Phase 7 (Performance, SEO, Recht,
Livegang) ist ohnehin für ganz zum Schluss vorgesehen. Sobald die
Zugangsdaten oben eingetragen sind und ein echter Test geklappt hat, steht
Phase 6 als Nächstes an.
