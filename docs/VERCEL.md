# Vercel verbinden & Preview starten — Anleitung

Für dich, Claudio. Ziel: die neue Seite als **Preview** bei Vercel sehen, **ohne**
etwas an der Domain zu ändern. Die alte Seite bleibt die ganze Zeit online.

Ich habe den Branch `feat/relaunch` bereits zu GitHub gepusht — er ist also bereit
zum Verbinden.

---

## Teil 1 — Vercel-Konto & Repo verbinden

1. Geh auf **https://vercel.com** → **Sign Up**.
2. Wähle **„Continue with GitHub"** und melde dich mit deinem GitHub-Konto an
   (`Claudio5Schmid`). So sieht Vercel dein Repository.
3. Vercel fragt nach Zugriff auf deine Repos. Du kannst **„Only select repositories"**
   wählen und **nur `improveyourskills`** freigeben — das reicht.
4. Nach dem Login: **„Add New…" → „Project"**.
5. In der Liste erscheint **`improveyourskills`** → **„Import"**.

## Teil 2 — Projekt konfigurieren

6. Vercel erkennt **Next.js** automatisch. **Framework Preset: Next.js** sollte schon
   dastehen. Build- und Output-Einstellungen: **nichts ändern**, die Standardwerte
   stimmen.
7. **Environment Variables:** für die Phase-1-Preview **keine nötig** — dieses Feld
   einfach leer lassen (die vollständige Liste für später steht unten).
8. ⚠️ **Wichtig — Production Branch:** Unsere neue Seite lebt aktuell nur auf dem
   Branch **`feat/relaunch`**, nicht auf `main` (dort liegt noch die alte Seite).
   Damit Vercel das Richtige baut, hast du zwei Wege:
   - **Einfach:** Erst importieren/deployen lassen, dann unter
     **Settings → Git → Production Branch** von `main` auf **`feat/relaunch`**
     umstellen und einmal neu deployen. So wird unsere Seite gebaut.
   - **Oder:** `main` als Production lassen — dann **schlägt der Production-Build fehl**
     (auf `main` gibt es keine Next.js-App). Das ist **kein Fehler unsererseits** und
     unkritisch: entscheidend ist die **Preview-URL** von `feat/relaunch` (siehe unten).
   Ich empfehle den einfachen Weg.
9. **„Deploy"** klicken. Der erste Build dauert 1–2 Minuten.

## Teil 3 — Preview ansehen

10. Nach dem Build zeigt Vercel eine **Deployment-URL** (Form `…vercel.app`). Das ist
    die neue Seite. Öffne sie und klick dich durch — vergleiche sie mit der alten
    `www.improveyourskills.ch` (die läuft unverändert weiter).
11. Jeder weitere Push auf `feat/relaunch` erzeugt automatisch eine neue Preview. Ich
    sage dir jeweils Bescheid, wenn es etwas Neues zu sehen gibt.

## Was NICHT passiert

- **Keine DNS-Änderung.** Deine Domain zeigt weiter auf die alte Seite. Die Umstellung
  auf Vercel machen wir erst in Phase 7, wenn du alles freigegeben hast
  (`docs/DNS-HOSTPOINT.md`).
- **`main` bleibt unangetastet.** Wir arbeiten ausschliesslich auf `feat/relaunch`.

---

## Environment-Variablen (Übersicht für alle Phasen)

**Für die Phase-1-Preview brauchst du KEINE.** Diese Liste ist die Vorschau auf das,
was in späteren Phasen dazukommt. Du setzt sie in Vercel unter
**Settings → Environment Variables** (dort kann man je Variable wählen: Production,
Preview, Development).

| Variable | Ab Phase | Zweck | Woher du den Wert bekommst |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 1–2 | Basis-URL für Canonical-Links, Open-Graph, Sitemap | Für die Preview die `…vercel.app`-URL; später `https://www.improveyourskills.ch` |
| `NEXT_PUBLIC_SUPABASE_URL` | 2 | Adresse deines Supabase-Projekts (öffentlich, ungefährlich) | Supabase → Project Settings → **API** → „Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 2 | Öffentlicher Schlüssel für Lesezugriffe (durch RLS abgesichert) | Supabase → Project Settings → **API** → „anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | 2 | **Geheim.** Voller Serverzugriff, nur serverseitig. **Nie** öffentlich, nie ins Repo. | Supabase → Project Settings → **API** → „service_role" |
| `RESEND_API_KEY` | 5 | Versand der Kontakt-E-Mails | Resend → **API Keys** → „Create API Key" |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | 5 | Spam-Schutz im Formular (öffentlich) | Cloudflare → **Turnstile** → Widget anlegen → „Site Key" |
| `TURNSTILE_SECRET_KEY` | 5 | **Geheim.** Serverseitige Turnstile-Prüfung | Cloudflare → **Turnstile** → „Secret Key" |
| `CRON_SECRET` | 7 | Schützt den Keep-alive-Cron vor fremdem Aufruf | Du erzeugst einen zufälligen langen Text (z. B. Passwortgenerator) |

**Faustregel:** Alles mit `NEXT_PUBLIC_` darf im Browser landen (ungefährlich). Alles
**ohne** dieses Präfix ist geheim und bleibt serverseitig — diese Werte gibst du nur
in Vercel ein, nie ins Repository.

---

## Der tägliche Keep-alive (Phase 7)

**Warum es das gibt:** Supabase pausiert Gratis-Projekte nach rund 7 Tagen ohne
Aktivität. Ein pausiertes Projekt beantwortet keine Anfragen — die Website würde dann
auf ihre eingebauten deutschen Standardtexte zurückfallen: keine von dir bearbeiteten
Inhalte, keine hochgeladenen Bilder, bis jemand das Projekt von Hand wieder aufweckt.

Dagegen läuft **einmal täglich um 04:00 UTC** (also 05:00 bzw. 06:00 Schweizer Zeit)
ein winziger automatischer Aufruf, der einen einzigen Wert aus der Datenbank liest.
Das genügt, damit Supabase das Projekt als aktiv zählt. Eingerichtet ist das in
`vercel.json`; der Endpunkt selbst ist `/api/cron/keep-alive`.

> Warum ausgerechnet in `vercel.json`, wo doch sonst alles hoster-unabhängig in
> `next.config.ts` liegt? Weil es für zeitgesteuerte Aufgaben schlicht keine
> hoster-unabhängige Variante gibt. Die Datei enthält deshalb **nur** den Zeitplan.

**Was du tun musst — einmalig:**

1. Einen langen Zufallstext erzeugen (Passwortgenerator, ca. 40 Zeichen).
2. In Vercel unter **Settings → Environment Variables** als `CRON_SECRET` hinterlegen,
   für **Production**.
3. Neu deployen (oder das nächste Deployment abwarten).

**Wichtig:** Ohne gesetztes `CRON_SECRET` verweigert der Endpunkt bewusst den Dienst
(Antwort 503). Das ist Absicht — sonst könnte ihn jeder Fremde aufrufen. Der Preis
davon: wenn du den Wert vergisst, läuft der Keep-alive nicht, und das Projekt pausiert
irgendwann trotzdem. Du siehst das in Vercel unter **Cron Jobs** als fehlgeschlagenen
Lauf.

Ob es funktioniert hat, siehst du dort ebenfalls: ein erfolgreicher Lauf antwortet
`{"ok":true,"ms":…}`.

---

## Wenn etwas klemmt

- **Production-Build (main) rot?** Erwartet, solange `main` noch die alte Seite ist —
  siehe Schritt 8. Für die Preview irrelevant.
- **Preview-Build rot?** Schick mir den Fehlertext aus dem Vercel-Log, dann schaue ich
  es an.
- **Repo taucht nicht auf?** In Vercel unter *Settings → Git* die GitHub-App-Berechtigung
  prüfen und `improveyourskills` freigeben.
