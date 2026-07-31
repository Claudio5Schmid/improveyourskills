-- ============================================================================
-- Seed — improveyourskills.ch
-- ----------------------------------------------------------------------------
-- The current live German copy, images, team and settings, so the site is fully
-- populated the moment the database is created. Nothing is reworded.
--
-- Idempotent: content_blocks use ON CONFLICT (key) DO NOTHING and the row
-- tables are guarded by NOT EXISTS, so re-running never duplicates or clobbers
-- later admin edits. EN/FR are left NULL (they fall back to German).
--
-- {year} / {nextYear} / {price} / {date} are placeholders the content layer
-- fills from site_settings (brief §2.4) — nothing about a year/price is fixed.
-- ============================================================================

-- ─── site_settings (single row) ─────────────────────────────────────────────
insert into public.site_settings
  (id, registration_open, current_edition_year, course_date, price_chf,
   contact_email, venue_name, venue_address)
values
  (true, false, 2026, date '2026-07-05', 48.00,
   'pascal.schmuki@bluewin.ch', 'Buchholz Sporthalle', '8610 Uster')
on conflict (id) do nothing;

-- ─── content_blocks: text & longtext ────────────────────────────────────────
insert into public.content_blocks (key, kind, value_de) values
  -- Global
  ('common.brand',            'text',     'Improve your skills'),
  ('nav.ueber',               'text',     'Über uns'),
  ('nav.impressionen',        'text',     'Impressionen'),
  ('nav.kontakt',             'text',     'Kontakt'),
  ('nav.anmelden',            'text',     'Anmelden'),
  ('footer.org',              'text',     'Organisiert von Vanessa Schmuki, Pascal Schmuki & Claudio Schmid'),
  -- Home · Hero
  ('home.hero.tag',           'text',     'Skill Training {year}'),
  ('home.hero.subtitle',      'text',     'U14 Männer & U17 Frauen'),
  ('home.hero.ctaPrimary',    'text',     'Jetzt anmelden'),
  ('home.hero.ctaSecondary',  'text',     'Mehr erfahren ↓'),
  -- Home · Was wir anbieten
  ('home.wwm.label',          'text',     'Was wir anbieten'),
  ('home.wwm.title',          'text',     'Unihockey Skill Training in Uster'),
  ('home.wwm.p1',             'longtext', 'Herzlich willkommen beim <b>Improve your skills</b> Skill Training – dem Tagescamp für Nachwuchsspieler:innen, die ihre Unihockey-Fähigkeiten gezielt auf das nächste Level bringen wollen.'),
  ('home.wwm.p2',             'longtext', 'Wir bieten dir ein intensives, praxisnahes Training unter der Leitung von drei Schweizer Nationalspieler:innen. Egal ob du deine Schusstechnik, dein Stick-Handling oder dein taktisches Verständnis verbessern möchtest!'),
  ('home.wwm.p3',             'longtext', 'Unsere Trainingsphilosophie: <b>Kleine Gruppen, maximale Wirkung.</b> Mit nur 30 Teilnehmer:innen pro Session hat jedes Kind die Möglichkeit, persönliches Feedback zu erhalten und sich spürbar zu verbessern.'),
  ('home.wwm.badge1',         'text',     '🏒 U14 Männer'),
  ('home.wwm.badge2',         'text',     '🏒 U17 Frauen'),
  ('home.wwm.cta',            'text',     'Jetzt anmelden – CHF {price}'),
  -- Home · Abschluss-Banner
  ('home.cta.title',          'text',     'Bereit für den nächsten Schritt?'),
  -- Über uns · Kopf
  ('ueber.header.tag',        'text',     'Das Team'),
  ('ueber.header.title',      'text',     'Über uns.'),
  ('ueber.header.subtitle',   'text',     'Drei Nationalspieler:innen. Eine gemeinsame Idee.'),
  -- Über uns · Unser Ansatz
  ('ueber.ansatz.label',      'text',     'Unser Ansatz'),
  ('ueber.ansatz.title',      'text',     'Etwas zurückgeben.'),
  ('ueber.ansatz.lead',       'longtext', 'Wir haben alle von grossen Vorbildern und guten Trainern profitiert. Jetzt ist es an uns, dieses Wissen weiterzugeben.'),
  ('ueber.ansatz.p',          'longtext', 'Das Skill Training ist nicht nur Sport – es ist eine Möglichkeit, Kindern zu zeigen, was möglich ist, wenn man gezielt trainiert und an sich glaubt. Wir bringen Erfahrungen aus dem Nationalteam und den besten Clubs Europas direkt auf die Halle in Uster.'),
  ('ueber.ansatz.feature1Title', 'text',  'Technik-Fokus'),
  ('ueber.ansatz.feature1Text',  'text',  'Stick-Handling, Schuss, Bewegung – gezielt verbessert'),
  ('ueber.ansatz.feature2Title', 'text',  'Kleine Gruppen'),
  ('ueber.ansatz.feature2Text',  'text',  'Max. 30 Kinder – jedes Kind bekommt persönliches Feedback'),
  ('ueber.ansatz.feature3Title', 'text',  'Top-Level Trainer'),
  ('ueber.ansatz.feature3Text',  'text',  'Nationalspieler:innen mit jahrelanger Wettkampferfahrung'),
  ('ueber.ansatz.cta',        'text',     'Jetzt anmelden'),
  -- Über uns · Team
  ('ueber.team.label',        'text',     'Eure Trainer'),
  ('ueber.team.title',        'text',     'Das Team dahinter.'),
  -- Impressionen
  ('impressionen.tag',        'text',     'Galerie'),
  ('impressionen.title',      'text',     'Impressionen.'),
  ('impressionen.subtitle',   'text',     'Eindrücke vom Skill Training – alle Fotos an einem Ort.'),
  -- Kontakt
  ('kontakt.tag',             'text',     'Fragen? Meld dich!'),
  ('kontakt.title',           'text',     'Kontakt.'),
  ('kontakt.infoTitle',       'text',     'Wir freuen uns von dir zu hören.'),
  ('kontakt.infoText',        'longtext', 'Bei Fragen rund um das Skill Training, Anmeldungen oder die Veranstaltung stehen wir dir gerne zur Verfügung.'),
  ('kontakt.emailButton',     'text',     '✉️ Schreib uns eine E-Mail'),
  -- Anmeldung (geschlossener Zustand)
  ('anmeldung.tag',           'text',     'Anmeldung'),
  ('anmeldung.title',         'text',     'Bis {nextYear}.'),
  ('anmeldung.subtitle',      'text',     'Die Anmeldung für das Skill Training ist aktuell geschlossen.'),
  ('anmeldung.label',         'text',     'Save the Date'),
  ('anmeldung.heading',       'text',     'Anmeldungen & Infos folgen im {nextYear}.'),
  ('anmeldung.text',          'longtext', 'Das nächste Improve-your-skills Skill Training in Uster ist bereits in Planung. Alle Details sowie die Anmeldung schalten wir rechtzeitig wieder hier auf. Schau zu gegebener Zeit einfach nochmals vorbei – wir freuen uns auf dich!'),
  ('anmeldung.back',          'text',     'Zurück zur Startseite')
on conflict (key) do nothing;

-- ─── content_blocks: images ─────────────────────────────────────────────────
-- Current image paths under public/. The three hero slides show general match
-- photos today (the code comment asks for trainer photos — see PLATZHALTER B6).
-- ueber.header.image is intentionally empty (placeholder B5).
insert into public.content_blocks (key, kind, image_path, image_alt_de) values
  ('home.hero.image1',      'image', '/Bilder/55193886120_4a1069cdcf_o.jpeg', ''),
  ('home.hero.image2',      'image', '/Bilder/54878038952_978afe6028_o.jpg',  ''),
  ('home.hero.image3',      'image', '/54923280127_69f6204584_k.jpg',         ''),
  ('home.wwm.image',        'image', '/Bilder/Bild_Waswirmachen.JPG',         'Unihockey Skill Training'),
  ('ueber.header.image',    'image', null,                                    ''),
  ('impressionen.headerImage', 'image', '/Bilder/Bilderimpressionen-hintergrund.jpg.JPG', '')
on conflict (key) do nothing;

-- ─── team_members (guarded: only seed when empty) ───────────────────────────
insert into public.team_members (sort_order, name, role_de, extra_de, photo_path)
select * from (values
  (1, 'Claudio Schmid',  'Organisator & Trainer',   'Nationalspieler · SVWE (Rekordmeister Schweizer Unihockey)',                              '/Bilder/5_claudio_schmid.png'),
  (2, 'Pascal Schmuki',  'Organisator & Trainer',   'Nationalspieler · Storvreta IBK (Schweden, bester Verein der Welt)',                      '/Bilder/17_pascal_schmuki.jpg.avif'),
  (3, 'Vanessa Schmuki', 'Organisatorin & Trainerin','Nationalspielerin · Weltmeisterin · 2-fache Schweizer Meisterin · Kloten-Dietlikon Jets', '/Bilder/20_vanessa_schmuki.jpg')
) as v(sort_order, name, role_de, extra_de, photo_path)
where not exists (select 1 from public.team_members);

-- ─── carousel_images (guarded: only seed when empty) ────────────────────────
insert into public.carousel_images (sort_order, image_path)
select * from (values
  (1, '/Bilder/54984091234_0a498c59d6_o.jpg'),
  (2, '/Bilder/54560170314_01b6b9c809_o.jpeg'),
  (3, '/Bilder/54983832553_b1dfd1ce04_o.jpg'),
  (4, '/Bilder/1ECD3D4C-B83D-4BF2-B8C0-EE69FF124190.jpg')
) as v(sort_order, image_path)
where not exists (select 1 from public.carousel_images);
