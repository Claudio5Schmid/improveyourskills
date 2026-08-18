-- ============================================================================
-- Media storage bucket — improveyourskills.ch
-- ----------------------------------------------------------------------------
-- One bucket for every admin-managed image (hero, "was wir anbieten", team
-- photos, carousel, testimonials, page headers, …). Deliberately separate from
-- the gallery bucket that Phase 4 will add, because the two have completely
-- different rules:
--
--   * media   — public, cached, referenced from HTML by URL
--   * gallery — private, always streamed through our own route so we can set
--               X-Robots-Tag: noindex, noimageindex on every response
--
-- Public read + admin write. Anon has no way to write here; the file size and
-- MIME whitelist are enforced by the bucket itself (belt) AND checked again in
-- the upload code (braces).
-- ============================================================================

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media',
   'media',
   true,
   5 * 1024 * 1024,
   array['image/webp', 'image/jpeg', 'image/png']::text[])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- RLS on storage.objects
-- ---------------------------------------------------------------------------
-- The `storage.objects` table already has RLS enabled by Supabase. We add
-- four scoped policies that only ever touch our `media` bucket, so nothing
-- else in storage is affected. Names are prefixed so Supabase's own policies
-- (e.g. for the gallery bucket added in Phase 4) can coexist without clashing.
-- ---------------------------------------------------------------------------

drop policy if exists "media: public read"   on storage.objects;
drop policy if exists "media: admin insert"  on storage.objects;
drop policy if exists "media: admin update"  on storage.objects;
drop policy if exists "media: admin delete"  on storage.objects;

create policy "media: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
