# Resend & Turnstile einrichten — für das Kontaktformular (Phase 5)

Das Kontaktformular funktioniert technisch schon, aber zwei externe Dienste
brauchen deine eigenen Zugangsdaten, bevor es **live** wirklich E-Mails
verschickt und Spam abwehrt. Bis dahin läuft es im „Testmodus": Nachrichten
werden trotzdem gespeichert und erscheinen im Admin unter „Nachrichten" — nur
der Mailversand fehlt.

## 1. Resend-Konto anlegen

1. Auf [resend.com](https://resend.com) registrieren (kostenloses Kontingent
   reicht für dieses Projekt bei Weitem).
2. **API-Key erzeugen:** Dashboard → *API Keys* → *Create API Key*. Name z. B.
   „improveyourskills-prod". Den Wert sofort kopieren — er wird nur einmal
   angezeigt.
3. In Vercel unter *Settings → Environment Variables* eintragen:
   - `RESEND_API_KEY` = der eben erzeugte Schlüssel (Production **und**
     Preview).
   - `CONTACT_TO_EMAIL` = die Adresse, die neue Anfragen bekommen soll, z. B.
     `info@improveyourskills.ch` (Production **und** Preview). **Kein
     Fallback** — ohne diesen Wert wird die Benachrichtigung übersprungen und
     nur als Fehler geloggt, statt irgendwo unkontrolliert zu landen. Die
     Nachricht selbst geht dabei trotzdem nicht verloren (landet weiterhin im
     Admin unter „Nachrichten").

**Zwischenstand:** Ab hier funktioniert der Versand bereits — aber nur mit
Resends eigener Testadresse (`onboarding@resend.dev`) als Absender, und die
kommt **nur bei dir selbst** (dem Resend-Account-Inhaber) an, unabhängig
davon, was bei `CONTACT_TO_EMAIL` steht. Für den echten Betrieb (Mails, die
auch bei Dritten ankommen) muss die eigene Domain verifiziert sein —
Schritt 2.

## 2. Domain verifizieren (DNS bei Hostpoint)

1. Resend-Dashboard → *Domains* → *Add Domain* → `improveyourskills.ch`
   eintragen, Region **Europe (Frankfurt)** wählen (bleibt in der EU, passend
   zu Supabase).
2. Resend zeigt dir daraufhin **drei DNS-Einträge** an, ungefähr in dieser
   Form (die **exakten** Werte — insbesondere der lange DKIM-Schlüssel —
   bekommst du erst dort angezeigt, nicht hier):

   | Typ       | Name/Host (Beispiel)     | Zweck                                                              |
   | --------- | ------------------------ | ------------------------------------------------------------------- |
   | **TXT**   | `send.improveyourskills.ch` (SPF) | sagt anderen Mailservern: „Resend darf in unserem Namen senden"     |
   | **TXT/CNAME** | `resend._domainkey`  (DKIM) | digitale Signatur, beweist, dass eine Mail wirklich von uns kommt   |
   | **TXT**   | `_dmarc`                 | sagt, was mit Mails passieren soll, die SPF/DKIM nicht bestehen     |

3. Diese drei Einträge bei **Hostpoint** eintragen: Kunden-Login →
   Domain/DNS-Verwaltung → `improveyourskills.ch` → DNS-Zone bearbeiten →
   für jeden der drei Einträge einen neuen Eintrag mit Typ/Name/Wert genau
   wie im Resend-Dashboard anlegen.
4. Zurück im Resend-Dashboard auf **Verify** klicken. DNS-Änderungen brauchen
   erfahrungsgemäss Minuten bis wenige Stunden, bis sie überall sichtbar sind.
5. Sobald „Verified" angezeigt wird, in Vercel die Variable setzen:
   - `RESEND_FROM_EMAIL` = z. B. `Improve your skills <kontakt@improveyourskills.ch>`
     (Production **und** Preview).

Ohne Schritt 5 (also mit leerem `RESEND_FROM_EMAIL`) funktioniert der Code
weiterhin — er fällt automatisch auf die Resend-Testadresse zurück. Das ist
also **kein Blocker**, nur eine Voraussetzung für echten Mailversand an Dritte.

## 3. Cloudflare Turnstile (Spam-Schutz)

1. Auf [dash.cloudflare.com](https://dash.cloudflare.com) einloggen (oder
   kostenlos registrieren — Turnstile selbst ist komplett gratis, auch ohne
   dass die Domain bei Cloudflare liegt).
2. *Turnstile* im Menü → *Add Site*. Domain: `improveyourskills.ch` (und für
   lokale Vorschauen zusätzlich `*.vercel.app`, falls ihr Preview-Links
   testet). Widget-Modus: „Managed" (Standard) reicht.
3. Cloudflare zeigt dir zwei Schlüssel:
   - **Site Key** (öffentlich) → in Vercel als `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
     eintragen (Schreibweise exakt so, sonst bleibt die Box unsichtbar).
   - **Secret Key** (geheim) → in Vercel als `TURNSTILE_SECRET_KEY`
     (Production **und** Preview, kein `NEXT_PUBLIC_`-Präfix — er darf nie im
     Browser landen).

Bis diese beiden Werte gesetzt sind, funktioniert das Formular **nicht** —
anders als bei Resend ist das hier kein optionaler Feinschliff, sondern die
Sicherheitsprüfung selbst.

## 4. Salt für die IP-Hashing (einmalig, lokal erzeugen)

Damit gespeicherte Nachrichten nie eine echte IP-Adresse enthalten, wird sie
vor dem Speichern mit einem zufälligen, geheimen „Salt" verrechnet. Einmal
erzeugen und dauerhaft so lassen (ein späteres Ändern macht alte Einträge für
die Rate-Begrenzung wertlos, aber nicht unsicher):

```bash
openssl rand -hex 32
```

Ergebnis in Vercel als `CONTACT_IP_HASH_SALT` eintragen (Production **und**
Preview, unterschiedliche Werte pro Umgebung sind unproblematisch).

## Google Maps auf der Kontaktseite

Das war ursprünglich als offene Frage vorgesehen (Audit §7, Frage 4) — ist
aber bereits seit Phase 1 als **„Karte laden"-Knopf** umgesetzt: Google
bekommt erst dann eine Anfrage, wenn jemand aktiv klickt. Nichts weiter zu
tun.

## Checkliste

- [ ] `RESEND_API_KEY` in Vercel (Production + Preview)
- [ ] `CONTACT_TO_EMAIL` in Vercel gesetzt (Production + Preview)
- [ ] Domain in Resend verifiziert
- [ ] `RESEND_FROM_EMAIL` in Vercel gesetzt
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel
- [ ] `TURNSTILE_SECRET_KEY` in Vercel
- [ ] `CONTACT_IP_HASH_SALT` in Vercel
- [ ] Testnachricht über das echte Formular geschickt, in „Nachrichten" im
      Admin geprüft, E-Mail bei der `CONTACT_TO_EMAIL`-Adresse angekommen
