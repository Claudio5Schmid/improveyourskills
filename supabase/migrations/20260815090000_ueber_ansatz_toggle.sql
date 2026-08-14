-- ---------------------------------------------------------------------------
-- Adds an explicit on/off switch for the "Etwas zurückgeben" section on the
-- Über-uns page (carousel + intro text + feature icons + CTA). Block B of the
-- Aug-2026 UI pass moves that section (and the stats band) below the team
-- cards and hides it by default — there's no natural "empty" signal for it
-- (the carousel falls back to static images even with zero DB rows), so a
-- single settings flag is simpler than gating on row counts. Defaults to
-- false so the section stays hidden until re-enabled in
-- Admin → Einstellungen.
-- ---------------------------------------------------------------------------
alter table public.site_settings
  add column ueber_ansatz_visible boolean not null default false;
