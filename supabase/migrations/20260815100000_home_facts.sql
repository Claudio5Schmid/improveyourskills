-- ---------------------------------------------------------------------------
-- home_facts — the "Eckdaten auf einen Blick" block on the homepage (Block E,
-- Aug 2026 UI-pass). Same row-list shape as team_members/carousel_images/
-- testimonials/stats: id, sort_order, per-locale text, visible, created_at.
--
-- `status` lets an admin publish a fact before a concrete date/value exists:
--   'set'  — value_* holds a real value, shown as-is (e.g. a date, a price).
--   'open' — no value yet, shown with a generic "date not yet set" hint.
--   'soon' — nothing to show yet, "more info coming" hint.
-- The hint text itself is translatable copy (home.facts.statusOpen /
-- .statusSoon in content_blocks), not stored per-row — every 'open'/'soon'
-- fact shares the same hint.
--
-- `icon` is a string key into a fixed lucide-react icon map on the frontend
-- (see src/lib/facts-icons.ts) — deliberately not a free-text field so the
-- admin picker and the public render can never drift apart.
-- ---------------------------------------------------------------------------
create table public.home_facts (
  id         uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  icon       text not null default 'calendar',
  label_de   text not null default '',
  label_en   text,
  label_fr   text,
  status     text not null default 'set' check (status in ('set', 'open', 'soon')),
  value_de   text,
  value_en   text,
  value_fr   text,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);
create index home_facts_order_idx on public.home_facts (sort_order);

alter table public.home_facts enable row level security;

create policy "home_facts: public read visible"
  on public.home_facts for select
  to anon, authenticated
  using (visible);

create policy "home_facts: admin all"
  on public.home_facts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
