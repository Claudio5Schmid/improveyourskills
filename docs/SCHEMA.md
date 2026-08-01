# Datenbank-Schema — improveyourskills.ch

**Stand:** 1. August 2026 · Migrationen in `supabase/migrations/`

Neun Tabellen im Schema `public`, alle mit aktivierter RLS (siehe `docs/RLS.md`).
Zwischen den Inhaltstabellen gibt es bewusst keine Verknüpfungen — jede ist für sich
editierbar. Die einzige Beziehung ist zu Supabases `auth.users` (wer ist Admin, wer hat
zuletzt gespeichert).

```mermaid
erDiagram
  auth_users ||--o| admins : "ist Admin"
  auth_users ||--o{ content_blocks : "updated_by"
  auth_users ||--o| site_settings : "updated_by"
  auth_users ||--o{ gallery_photos : "uploaded_by"

  admins {
    uuid id PK "= auth.users.id"
    text display_name
  }
  content_blocks {
    uuid id PK
    text key UK "z.B. home.hero.title"
    text kind "text|longtext|image|url|boolean"
    text value_de_en_fr
    text image_path
  }
  team_members {
    uuid id PK
    int  sort_order
    text name
    text role_de_en_fr
    text extra_de_en_fr
    text photo_path
    bool visible
  }
  carousel_images {
    uuid id PK
    int  sort_order
    text image_path
    text alt_de_en_fr
    bool visible
  }
  testimonials {
    uuid id PK
    int  sort_order
    text quote_de_en_fr
    text author_name
    bool visible
  }
  stats {
    uuid id PK
    int  sort_order
    text value
    text label_de_en_fr
    bool visible
  }
  site_settings {
    bool id PK "Singleton = true"
    bool registration_open
    int  current_edition_year
    date course_date
    numeric price_chf
    text venue_name_address
    text contact_email
  }
  gallery_photos {
    uuid id PK
    int  year
    text path_thumb_medium_large
    int  width_height_x3
    text blur_data_url
    bool hidden
  }
  contact_messages {
    uuid id PK
    text first_name_last_name
    text email
    text message
    text locale
    timestamptz read_at
    text ip_hash
    text email_delivery_status
  }
```

## Zweck je Tabelle

| Tabelle | Wofür | Öffentlich sichtbar? |
|---|---|---|
| `admins` | Wer darf bearbeiten (Zuordnung zu Login) | nein |
| `content_blocks` | Alle editierbaren Texte & Bilder (Schlüssel/Wert) | ja (lesen) |
| `team_members` | Die Trainer-Karten | ja (sichtbare) |
| `carousel_images` | Das Über-uns-Karussell | ja (sichtbare) |
| `testimonials` | Zitate (Phase 6) | ja (sichtbare) |
| `stats` | Zahlenband (Phase 6) | ja (sichtbare) |
| `site_settings` | Jahr, Datum, Preis, Anmeldestatus, Ort, Kontakt | ja (lesen) |
| `gallery_photos` | Galerie (Phase 4) | ja (nur nicht-versteckte) |
| `contact_messages` | Kontaktformular-Eingänge (Phase 5) | **nein** (nur Admins) |

## Hilfsfunktionen

- `set_updated_at()` — hält `updated_at` bei jeder Änderung aktuell.
- `is_admin()` — prüft, ob die aktuelle Anfrage von einem Admin kommt (Basis aller
  Schreibrechte).

## Reihenfolge der Migrationen

1. `…172854_initial_schema.sql` — Tabellen + Hilfsfunktionen
2. `…172855_rls_policies.sql` — RLS aktivieren + alle Policies
3. `…152807_seed_content.sql` — die aktuellen Inhalte (idempotent)
