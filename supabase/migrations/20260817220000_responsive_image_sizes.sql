-- ---------------------------------------------------------------------------
-- Responsive image sizes (Phase 7 Performance). Extends the single-size
-- upload used since Phase 3 to three WebP variants per image, matching the
-- gallery's proven approach (Phase 4, gallery_photos.path_thumb/medium/large)
-- and the brief's exact numbers: thumb 480px, medium 1200px, large 2000px.
--
-- The existing image_path/photo_path column keeps its name and meaning — it
-- IS the large (2000px) variant, unchanged. Only thumb and medium are new,
-- both nullable: every row uploaded before this migration has them NULL and
-- keeps rendering exactly as before (the frontend falls back to the large
-- path alone, no srcset) until re-uploaded through the updated admin UI.
-- ---------------------------------------------------------------------------
alter table public.content_blocks
  add column image_path_thumb  text,
  add column image_path_medium text;

alter table public.team_members
  add column photo_path_thumb  text,
  add column photo_path_medium text;

alter table public.carousel_images
  add column image_path_thumb  text,
  add column image_path_medium text;
