# Admin — improveyourskills.ch

Der Admin lebt unter `/admin` und wird per Magic Link geschützt. Es gibt bewusst
kein Passwort. Alle vier Konten sind gleichwertig — es gibt keine Rollen. Diese
Seite erklärt Schritt für Schritt, was du im Supabase-Dashboard einmalig
einstellen musst und wie neue Zugänge vergeben werden.

## Einmal-Einstellungen im Supabase-Dashboard

**Zeitaufwand:** ca. 5 Minuten. Diese Schritte hängen von deinem Supabase-Konto
ab; ich kann sie nicht für dich machen.

1. Öffne https://supabase.com/dashboard/project/rrbammpuowneztbxpcht — das ist
   dein Projekt.
2. **Öffentliche Registrierung deaktivieren.**
   - Links auf **Authentication** klicken → **Sign In / Providers** → **Email**.
   - Den Schalter **„Enable Email Signup"** ausschalten (nicht Email Provider,
     nur Signup). So kann niemand von aussen ein Konto anlegen.
   - Der Schalter **„Enable Email Provider"** muss AN bleiben — sonst kommen
     Magic Links gar nicht durch.
   - Bei **Sign Up Restrictions** kann optional zusätzlich eine
     E-Mail-Allowlist gepflegt werden (nicht nötig, wenn Signup ohnehin aus
     ist).
3. **URL-Konfiguration setzen.** Ohne diesen Schritt landet der Magic Link auf
   einer falschen Adresse.
   - **Authentication → URL Configuration**.
   - **Site URL** = `https://<deine-vercel-domain>` (Preview) bzw. die echte
     Domain in Produktion.
   - Unter **Redirect URLs** zusätzlich `http://localhost:3000/admin/auth/callback`
     eintragen — sonst funktioniert der Admin lokal nicht.
   - Und `https://<deine-vercel-domain>/admin/auth/callback`.
4. **E-Mail-Vorlage für Magic Link auf `token_hash`-Format umstellen (empfohlen).**
   - **Authentication → Email Templates → Magic Link**.
   - Den Link im Template ersetzen durch:
     ```
     {{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=magiclink
     ```
   - Grund: mit dieser Variante darf der Link im **Handy** geöffnet werden,
     auch wenn du ihn am Laptop angefordert hast. Ohne die Umstellung
     funktioniert der Link nur im selben Browser wie die Anmeldung.

## Eine Person zum Admin machen

**Zeitaufwand:** ca. 2 Minuten pro Person.

1. **Authentication → Users → „Invite user"**.
2. E-Mail-Adresse eingeben, senden. Die Person erhält einen Einladungslink und
   ist danach ein Supabase-User — aber noch **kein** Admin.
3. **Table Editor → `admins`** öffnen → **Insert row** → `id` = die User-ID
   aus der User-Liste (Column „UUID"), `display_name` = Vorname, den du im
   Admin-Header sehen willst.
4. Person kann sich jetzt unter `https://<deine-domain>/admin/login` einloggen.

Diese Doppelung (Supabase-User + Zeile in `admins`) ist Absicht: sie stellt
sicher, dass ein versehentlich angelegter oder eingeladener Nutzer noch keinen
Zugriff hat, solange er nicht ausdrücklich zur `admins`-Tabelle hinzugefügt
wurde.

## Zugang wieder entziehen

Zeile aus `admins` löschen — der Login bleibt für Supabase gültig, aber der
Callback wirft die Person mit einer Fehlermeldung sofort raus. Optional den
User zusätzlich unter **Authentication → Users** löschen.

## Was du im Admin selbst tun kannst

- **Übersicht** — zeigt alle Felder, die noch leer sind, mit Direktlink in den
  Editor.
- **Inhalte** — jeder Text und jedes Bild der öffentlichen Seite, gegliedert
  nach Startseite / Über uns / Impressionen / Kontakt / Anmeldung / Global.
  DE/EN/FR-Reiter oben; leere EN/FR fallen automatisch auf Deutsch zurück.
- **Team** — Trainer-Karten anlegen/löschen, Reihenfolge per Ziehen ändern,
  Karte per Häkchen unsichtbar schalten.
- **Karussell** — die Bilder oben auf Über uns.
- **Zitate & Zahlen** — für die Sektionen, die in Phase 6 auf Über uns
  eingebaut werden.
- **Anmeldung & Einstellungen** — Jahr/Datum/Preis/Ort und der Schalter
  „Anmeldung offen/geschlossen".
- **Galerie / Nachrichten** — kommen in Phase 4 bzw. Phase 5.

## Wenn's klemmt

- **„Dieser Anmelde-Link ist abgelaufen"** — Link ist älter als eine Stunde
  oder wurde bereits benutzt. Neuen anfordern.
- **„Diese Adresse hat keine Admin-Berechtigung"** — Person ist in
  Supabase-Users, aber nicht in `admins`. Schritt 3 oben nachholen.
- **Nichts kommt an** — Supabase-Dashboard → **Logs → Auth** öffnen; wenn
  Rate-Limit steht (100/Stunde per E-Mail-Adresse), warten. Spam-Ordner nicht
  vergessen.
