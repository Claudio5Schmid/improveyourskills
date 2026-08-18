-- ============================================================================
-- Gallery storage bucket — improveyourskills.ch (Phase 4)
-- ----------------------------------------------------------------------------
-- The `gallery_photos` table and its RLS already exist (Phase 2 migration
-- 20260729172854/55) — public can SELECT rows where hidden = false, admins can
-- do everything. This migration only adds the bucket that holds the actual
-- image bytes, and it is deliberately PRIVATE with NO public policy at all.
--
-- Why no public read policy, unlike the `media` bucket: a storage RLS policy
-- can only see storage.objects (bucket_id, path, …) — it has no way to check
-- our `hidden` flag, which lives in a different table. If we allowed public
-- SELECT on this bucket, anyone who guessed or was sent an object path could
-- read a hidden ("taken down") photo directly from Supabase, bypassing the
-- takedown entirely. So public access goes exclusively through our own
-- `/api/foto/[id]/[size]` route, which checks `hidden` in the DB first and
-- then reads the bytes with the service-role key (bypasses storage RLS,
-- server-side only — see src/lib/supabase/service.ts).
--
-- Admins DO get a read policy, so the admin gallery UI can preview freshly
-- uploaded images via the admin's own session, the same way the `media`
-- bucket already works for content images.
-- ============================================================================

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery',
   'gallery',
   false,
   8 * 1024 * 1024,
   array['image/webp']::text[])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gallery: admin select" on storage.objects;
drop policy if exists "gallery: admin insert" on storage.objects;
drop policy if exists "gallery: admin update" on storage.objects;
drop policy if exists "gallery: admin delete" on storage.objects;

create policy "gallery: admin select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

create policy "gallery: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "gallery: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "gallery: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

-- No "gallery: public read" policy — intentional, see note above.
