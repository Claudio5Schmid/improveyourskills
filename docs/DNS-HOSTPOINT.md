# DNS bei Hostpoint — für den Livegang (Phase 7)

> ⚠️ **Noch NICHTS ändern.** Dieses Dokument ist die Vorbereitung. Die Umstellung
> passiert erst in Phase 7, wenn du die neue Seite freigegeben hast — mit
> dokumentiertem Rückweg. Bis dahin bleibt die alte Seite unverändert online.

## Ausgangslage

- Die Domain ist bei **Hostpoint** registriert.
- Die Website läuft aktuell auf **`www.improveyourskills.ch`** (die Datei `CNAME` im
  Repository sagt genau das). Wir behalten **www als Hauptadresse** bei — das ist bei
  Hostpoint der unkompliziertere Weg und vermeidet Probleme mit der nackten Domain.
- Ziel: `www.improveyourskills.ch` zeigt auf **Netlify** statt auf GitHub Pages.

## Die Records, die später hinzukommen

Die **exakten** Werte bekommst du in Phase 7 aus dem Netlify-Dashboard
(*Site → Domain management*), sobald die Domain dort hinterlegt ist. Erfahrungsgemäss
sind es diese zwei:

| Typ | Name / Host | Wert (Ziel) | TTL |
|---|---|---|---|
| **CNAME** | `www` | `<dein-site-name>.netlify.app` | 3600 (1 Std.) |
| **A** | `@` (nackte Domain) | `75.2.60.5` *(Netlifys Load-Balancer — Wert in Phase 7 bestätigen)* | 3600 |

- Der **CNAME** für `www` ist der wichtige: er leitet die Hauptadresse auf Netlify.
- Der **A-Record** für die nackte Domain (`improveyourskills.ch` ohne www) sorgt dafür,
  dass auch `improveyourskills.ch` funktioniert und automatisch auf `www` weiterleitet
  (die Weiterleitung selbst macht Netlify).
- Manche Hostpoint-Oberflächen bieten für die nackte Domain auch eine **Weiterleitung**
  („URL-Forwarding") an — das ist eine Alternative zum A-Record und ebenfalls in Ordnung.

## TTL-Tipp

**Vor** der Umstellung (etwa 24 Std. vorher) die TTL der bestehenden Records auf einen
niedrigen Wert setzen (z. B. **300 Sekunden**). Dann greift die Umstellung schnell und
ein eventueller Rückweg ebenso. Nach erfolgreicher Umstellung kann die TTL wieder hoch
(3600).

## Ablauf in Phase 7 (grobe Reihenfolge — Details folgen dort)

1. Netlify-Seite läuft und ist von dir freigegeben (Preview geprüft).
2. In Netlify die Domain `www.improveyourskills.ch` als *Custom Domain* hinzufügen.
3. Netlify zeigt dir die exakten Records → bei Hostpoint eintragen.
4. Warten, bis die Records greifen (Minuten bis Stunden), mit `dig` / einem DNS-Checker
   prüfen.
5. HTTPS-Zertifikat in Netlify ausstellen lassen (automatisch, Let's Encrypt).
6. Alle alten `.html`-URLs in Produktion testen (301-Weiterleitungen).

## Rückweg (falls etwas nicht stimmt)

Die alten DNS-Werte **vor** der Änderung notieren (Screenshot der Hostpoint-Zone
genügt). Zum Zurückrollen einfach die alten Werte wiederherstellen — dank niedriger TTL
ist die alte Seite in Minuten wieder aktiv. Die alte Seite auf GitHub Pages bleibt die
ganze Zeit unangetastet bestehen.
