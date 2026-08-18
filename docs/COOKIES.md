# Cookie-Banner — warum wir keinen brauchen

Für dich, Claudio, als Beleg, falls dich das mal jemand fragt (Elternteil, Behörde,
Trainer:in). **Ich bin keine Rechtsberatung** — das hier ist die technische
Begründung, kein juristisches Gutachten.

## Die Regel

Ein Cookie-Banner mit Einwilligung braucht es nur für Cookies, die **nicht**
technisch notwendig sind — typischerweise Werbe- oder Tracking-Cookies, die
Besucher:innen über mehrere Websites hinweg wiedererkennen. Rein funktionale
Cookies (Login-Sitzung, Spracheinstellung, Spam-Schutz) sind davon ausgenommen.

## Was auf improveyourskills.ch tatsächlich läuft

| Cookie | Wofür | Wann aktiv |
| --- | --- | --- |
| `NEXT_LOCALE` | merkt sich die gewählte Sprache | bei jedem Besuch |
| Supabase-Sitzungs-Cookie | hält eingeloggte Organisator:innen im Admin angemeldet | nur wenn jemand von euch eingeloggt ist |
| Cloudflare-Turnstile-Cookie | erkennt Formular-Spam auf `/kontakt` | nur beim Absenden des Kontaktformulars |

Keines davon dient Werbung, keines erkennt Besucher:innen über andere Websites
hinweg wieder. Alle drei sind für den Betrieb der Website bzw. des Formulars
notwendig — genau die Kategorie, die ohne Einwilligung auskommt.

## Warum das trägt (und woran es hängt)

Die Begründung "nur notwendige Cookies" funktioniert nur, wenn die Website
tatsächlich **nichts nachlädt, das selbst Tracking wäre** — sonst wäre die
Begründung falsch, egal was hier steht. Deshalb zwei bewusste Entscheidungen
aus früheren Phasen, auf denen das aufbaut:

- **Schriften sind self-hosted** (Phase 1, `src/app/fonts.ts`) — kein Aufruf zu
  Google Fonts, der beim ersten Seitenaufruf ungefragt die IP-Adresse an Google
  schickt.
- **Google Maps lädt erst nach Klick** (Phase 5, `KontaktMap.tsx`) — keine
  eingebettete Karte, die beim Laden der Kontaktseite ungefragt Google-Cookies
  setzt.

Fällt eine der beiden Entscheidungen später weg (z. B. "wir wollen die Karte
doch immer sofort zeigen"), fällt auch diese Begründung weg — dann bräuchte es
wieder einen Banner.

## Cloudflare Web Analytics

Seit Phase 7 aktiv (`src/components/CloudflareAnalytics.tsx`, nur in der echten
Produktions-Version, nie lokal oder auf einer Vorschau). Cloudflare Web Analytics
ist **cookielos** (arbeitet ohne Cookie, misst aggregiert, erkennt niemanden
einzeln) — braucht deshalb selbst keinen Banner und ändert nichts an der
Begründung oben. Nur im `/admin`-Bereich läuft es bewusst nicht mit — das misst
den Besuch der Website, nicht die Arbeit der Organisator:innen im Admin.

## Wo das öffentlich steht

Die für Besucher:innen lesbare Fassung ist der Abschnitt "Cookies" auf
`/datenschutz` (`messages/{de,en,fr}.json`, Namespace `datenschutz`). Dieses
Dokument hier ist nur die interne Begründung dahinter.
