-- ============================================================================
-- Row Level Security — improveyourskills.ch
-- ----------------------------------------------------------------------------
-- RLS is enabled on EVERY table. The rules (brief §2.3):
--   * anon: SELECT only, and only on visible/published rows.
--   * hidden gallery photos are never returned to anon.
--   * contact_messages: anon has NO access at all (not select, not insert).
--     Inserts happen only via the service-role key in a server route.
--   * writes on all content tables: only admins (public.is_admin()).
--
-- Policies are permissive (OR-combined): a row is reachable if ANY policy
-- allows it. So a public "read visible" policy plus an "admin all" policy means
-- anon sees visible rows and admins see/manage everything.
-- The service_role key bypasses RLS (BYPASSRLS) — used only server-side.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- admins — never exposed to anon. Admins can see the admin list and edit their
-- own display name. Adding/removing admins happens via the dashboard / service
-- role, not from the client.
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;

create policy "admins: admins can read the list"
  on public.admins for select
  to authenticated
  using (public.is_admin());

create policy "admins: update own row"
  on public.admins for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- content_blocks — public read (all), admin write.
-- ---------------------------------------------------------------------------
alter table public.content_blocks enable row level security;

create policy "content_blocks: public read"
  on public.content_blocks for select
  to anon, authenticated
  using (true);

create policy "content_blocks: admin write"
  on public.content_blocks for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- team_members — public read of VISIBLE rows, admin sees/manages all.
-- ---------------------------------------------------------------------------
alter table public.team_members enable row level security;

create policy "team_members: public read visible"
  on public.team_members for select
  to anon, authenticated
  using (visible);

create policy "team_members: admin all"
  on public.team_members for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- carousel_images — public read of VISIBLE rows, admin all.
-- ---------------------------------------------------------------------------
alter table public.carousel_images enable row level security;

create policy "carousel_images: public read visible"
  on public.carousel_images for select
  to anon, authenticated
  using (visible);

create policy "carousel_images: admin all"
  on public.carousel_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- testimonials — public read of VISIBLE rows, admin all.
-- ---------------------------------------------------------------------------
alter table public.testimonials enable row level security;

create policy "testimonials: public read visible"
  on public.testimonials for select
  to anon, authenticated
  using (visible);

create policy "testimonials: admin all"
  on public.testimonials for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- stats — public read of VISIBLE rows, admin all.
-- ---------------------------------------------------------------------------
alter table public.stats enable row level security;

create policy "stats: public read visible"
  on public.stats for select
  to anon, authenticated
  using (visible);

create policy "stats: admin all"
  on public.stats for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- site_settings — public read (the site needs the year/date/price), admin write.
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;

create policy "site_settings: public read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings: admin write"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- gallery_photos — public read of NON-hidden rows only; admin sees/manages all.
-- The `hidden = false` check in the policy is the guarantee that a hidden photo
-- can never be returned to an anonymous client, even by a crafted query.
-- ---------------------------------------------------------------------------
alter table public.gallery_photos enable row level security;

create policy "gallery_photos: public read visible"
  on public.gallery_photos for select
  to anon, authenticated
  using (hidden = false);

create policy "gallery_photos: admin all"
  on public.gallery_photos for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- contact_messages — NO anon access at all. Only admins may read/update/delete.
-- There is deliberately NO insert policy: inserts come exclusively from the
-- server route using the service-role key (which bypasses RLS) after Turnstile.
-- We also revoke the table grants from anon as defence in depth, so anon has no
-- access even if a policy were ever added by mistake.
-- ---------------------------------------------------------------------------
alter table public.contact_messages enable row level security;

revoke all on public.contact_messages from anon;

create policy "contact_messages: admin read"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "contact_messages: admin update"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages: admin delete"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());
