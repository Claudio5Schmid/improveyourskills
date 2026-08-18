-- ============================================================================
-- Initial schema — improveyourskills.ch
-- ----------------------------------------------------------------------------
-- Everything the old static site hardcoded (copy, images, team, year, price,
-- date, registration state) now lives in these tables so it can be edited via
-- the admin (Phase 3) without touching code.
--
-- Row Level Security is enabled and policied in the next migration
-- (…_rls_policies.sql). This file only creates structure + helper functions.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh on every UPDATE.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admins — maps an authenticated user to a display name. Being in this table
-- is what grants write access everywhere (see is_admin()). Users are created
-- only by invitation (Supabase dashboard, public sign-up disabled). All admins
-- are equal — no role hierarchy.
-- ---------------------------------------------------------------------------
create table public.admins (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

-- is_admin() — true when the current request comes from an admin.
-- SECURITY DEFINER so it reads public.admins regardless of that table's own RLS
-- (prevents recursion); STABLE + fixed search_path for safety. Used by every
-- write policy in the RLS migration.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- content_blocks — the generic key/value store for all editable text & images.
-- `key` is a stable identifier (e.g. 'home.hero.title'); the list of valid keys
-- and their metadata lives in the typed registry (src/content/registry.ts).
-- ---------------------------------------------------------------------------
create table public.content_blocks (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  kind         text not null check (kind in ('text', 'longtext', 'image', 'url', 'boolean')),
  value_de     text,
  value_en     text,
  value_fr     text,
  image_path   text,
  image_alt_de text,
  image_alt_en text,
  image_alt_fr text,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null
);
create trigger content_blocks_set_updated_at
  before update on public.content_blocks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- team_members — the trainer cards (Über uns).
-- ---------------------------------------------------------------------------
create table public.team_members (
  id         uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  name       text not null,
  role_de    text,
  role_en    text,
  role_fr    text,
  extra_de   text,
  extra_en   text,
  extra_fr   text,
  photo_path text,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);
create index team_members_order_idx on public.team_members (sort_order);

-- ---------------------------------------------------------------------------
-- carousel_images — the Über-uns image carousel.
-- ---------------------------------------------------------------------------
create table public.carousel_images (
  id         uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  image_path text,
  alt_de     text,
  alt_en     text,
  alt_fr     text,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);
create index carousel_images_order_idx on public.carousel_images (sort_order);

-- ---------------------------------------------------------------------------
-- testimonials — quotes (Phase 6).
-- ---------------------------------------------------------------------------
create table public.testimonials (
  id             uuid primary key default gen_random_uuid(),
  sort_order     integer not null default 0,
  quote_de       text,
  quote_en       text,
  quote_fr       text,
  author_name    text,
  author_role_de text,
  author_role_en text,
  author_role_fr text,
  visible        boolean not null default true,
  created_at     timestamptz not null default now()
);
create index testimonials_order_idx on public.testimonials (sort_order);

-- ---------------------------------------------------------------------------
-- stats — the numbers band (Phase 6).
-- ---------------------------------------------------------------------------
create table public.stats (
  id         uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  value      text not null,
  label_de   text,
  label_en   text,
  label_fr   text,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);
create index stats_order_idx on public.stats (sort_order);

-- ---------------------------------------------------------------------------
-- site_settings — a single row holding the year/date/price/registration state
-- and venue/contact. The singleton is enforced by a boolean primary key that
-- can only ever be true.
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id                   boolean primary key default true,
  registration_open    boolean not null default false,
  current_edition_year integer not null default 2026,
  course_date          date,
  price_chf            numeric(8, 2),
  contact_email        text,
  venue_name           text,
  venue_address        text,
  updated_at           timestamptz not null default now(),
  updated_by           uuid references auth.users (id) on delete set null,
  constraint site_settings_singleton check (id = true)
);
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- gallery_photos — the on-site gallery (Phase 4). Three WebP variants per photo
-- with intrinsic sizes (to reserve layout space) and a blur-up placeholder.
-- `hidden` is the per-photo takedown switch.
-- ---------------------------------------------------------------------------
create table public.gallery_photos (
  id            uuid primary key default gen_random_uuid(),
  year          integer not null,
  path_thumb    text not null,
  path_medium   text not null,
  path_large    text not null,
  width_thumb   integer,
  height_thumb  integer,
  width_medium  integer,
  height_medium integer,
  width_large   integer,
  height_large  integer,
  blur_data_url text,
  sort_order    integer not null default 0,
  hidden        boolean not null default false,
  uploaded_by   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);
-- Partial index for the public query (visible photos of a given year, ordered).
create index gallery_photos_public_idx
  on public.gallery_photos (year, sort_order)
  where hidden = false;

-- ---------------------------------------------------------------------------
-- contact_messages — submissions from the contact form (Phase 5). The anon role
-- gets NO access to this table at all (enforced in the RLS migration); inserts
-- happen only through a server route using the service-role key after Turnstile.
-- IP is stored only as a salted hash.
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id                    uuid primary key default gen_random_uuid(),
  first_name            text not null,
  last_name             text not null,
  email                 text not null,
  message               text not null,
  locale                text not null default 'de',
  created_at            timestamptz not null default now(),
  read_at               timestamptz,
  ip_hash               text,
  email_delivery_status text not null default 'pending'
    check (email_delivery_status in ('pending', 'sent', 'failed'))
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);
