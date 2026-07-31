# RLS — Datensicherheit der Datenbank

**Stand:** 31. Juli 2026 · Migration `…172855_rls_policies.sql`

Dieses Dokument erklärt in einfachen Worten, wie die Datenbank abgesichert ist, und
zeigt die Testausgabe, die beweist, dass die Absicherung greift.

## Was ist RLS?

**Row Level Security** („Sicherheit auf Zeilenebene") ist ein Schutz direkt in der
Datenbank. Er entscheidet für **jede einzelne Anfrage**, welche Zeilen jemand sehen oder
verändern darf — unabhängig davon, was die Website oder ein Angreifer verlangt. Der Schutz
sitzt also **in der Datenbank selbst**, nicht nur im Website-Code. Selbst wenn im Code ein
Fehler wäre, käme man an geschützte Daten nicht heran.

Es gibt drei „Rollen", in denen jemand mit der Datenbank spricht:

- **anon** — anonym, also **jede Besucherin der öffentlichen Website**.
- **authenticated** — eingeloggt. Bei uns sind das **nur die eingeladenen Admins**
  (öffentliche Registrierung ist abgeschaltet).
- **service_role** — der geheime Server-Schlüssel, der die RLS **umgeht**. Er wird
  **ausschliesslich serverseitig** verwendet (nie im Browser), z. B. um eine
  Kontaktnachricht zu speichern.

**RLS ist auf jeder Tabelle aktiviert.** Ohne passende Regel ist alles gesperrt.

## Die Regeln je Tabelle (einfach erklärt)

| Tabelle | Anonyme Besucher (anon) | Admins (authenticated) |
|---|---|---|
| `content_blocks` (Texte/Bilder) | dürfen **lesen** | dürfen lesen **und ändern** |
| `team_members`, `carousel_images`, `testimonials`, `stats` | dürfen **nur sichtbare** Einträge lesen | alles lesen + ändern |
| `site_settings` (Jahr/Preis/Datum …) | dürfen **lesen** | dürfen ändern |
| `gallery_photos` (Galerie) | dürfen **nur nicht-versteckte** Fotos lesen | alle sehen + verwalten |
| `contact_messages` (Nachrichten) | **gar kein Zugriff** — nicht lesen, nicht schreiben | dürfen lesen, als gelesen markieren, löschen |
| `admins` (wer ist Admin) | **gar kein Zugriff** | dürfen die Liste sehen, eigenen Namen ändern |

Zusätzlich:

- **Nachrichten** kommen ausschliesslich über eine **Server-Route** in die Datenbank
  (mit dem geheimen `service_role`-Schlüssel, nach der Spam-Prüfung). Der `anon`-Rolle
  wurden die Rechte auf diese Tabelle sogar komplett **entzogen** — doppelte Absicherung.
- **Versteckte Fotos** (`hidden = true`) werden anonymen Besuchern **niemals** geliefert.
  Das ist unser „Foto entfernen"-Schalter, falls Eltern das wünschen: einmal verstecken,
  und das Foto ist sofort weg von der öffentlichen Seite — auch aus der API.
- **Schreiben** (anlegen/ändern/löschen) darf nur, wer in der `admins`-Tabelle steht. Das
  prüft die Datenbank-Funktion `is_admin()`.

## Der Beweis — Testausgabe

Getestet wird über **genau denselben Weg, den die Website nimmt** (die öffentliche API mit
dem anonymen Schlüssel). Ausgeführt am 31.07.2026 gegen das Live-Projekt:

```
Seed (service_role):
  ✓ PASS  content_blocks: 56 (erwartet 56)
  ✓ PASS  team_members: 3 (erwartet 3)
  ✓ PASS  carousel_images: 4 (erwartet 4)
  ✓ PASS  site_settings: 1 (erwartet 1)

RLS (anon role — was ein Website-Besucher ist):
  ✓ PASS  anon liest contact_messages → HTTP 401, kein Datenzugriff
  ✓ PASS  anon sieht das versteckte Foto NICHT (HTTP 200)
  ✓ PASS  anon sieht das sichtbare Foto (1 Foto für Jahr 9999)
  ✓ PASS  anon schreibt content_blocks → HTTP 401 (kein 201 = blockiert)

8 PASS / 0 FAIL
```

Das deckt die drei im Briefing geforderten Nachweise ab: anonym **kann keine Nachrichten
lesen**, **keine versteckten Fotos sehen** und **nichts schreiben** — plus die
Gegenprobe, dass sichtbare Inhalte korrekt geliefert werden.

## Wie man den Test wiederholt

Es gibt zwei gleichwertige Wege:

1. **SQL-Version:** `supabase/tests/rls_test.sql` — läuft in einer Transaktion, die
   zurückgerollt wird (hinterlässt keine Daten). Im Supabase-Dashboard unter **SQL Editor**
   einfügen und ausführen; jede Zeile meldet `PASS`/`FAIL`.
2. **API-Version:** das Prüfskript, das die obige Ausgabe erzeugt hat (testet die echte
   REST-API mit anon- und service-Schlüssel). Wird bei jedem Verbinden erneut ausgeführt.

## Wichtig für den Betrieb

- Der **`service_role`-Schlüssel** darf **nie** in den Browser oder ins Repository. Er lebt
  nur in Vercel (Server) und lokal in `.env.local` (gitignored).
- Neue Tabellen brauchen **immer** sofort RLS + Policies — sonst sind sie offen. Deshalb
  ist RLS Teil jeder Migration.
