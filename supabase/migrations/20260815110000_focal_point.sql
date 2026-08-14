-- ---------------------------------------------------------------------------
-- Focal-point image positioning (Block F, Aug 2026 UI-pass). No re-cropping —
-- only metadata: where the "important part" of an already-uploaded image is
-- (focal_x/focal_y, percent from top-left) and how far to zoom into it
-- (zoom, 1.0 = no zoom). The frontend renders with object-fit: cover +
-- object-position: {focal_x}% {focal_y}% and the zoom as a matching-origin
-- transform: scale() inside an overflow-hidden container (src/components/
-- PositionedImage.tsx) — the stored image file itself never changes.
--
-- Defaults (50/50/1.0) reproduce today's plain "center, no zoom" behaviour
-- exactly, so every existing image keeps rendering unchanged until an admin
-- explicitly repositions it.
--
-- Applied to every table that stores a directly-rendered image path:
-- content_blocks (hero/wwm/gallery/ueber header+banner+features),
-- team_members (trainer photo), carousel_images (Über-uns carousel),
-- gallery_photos (Impressionen — one focal point covers all three stored
-- sizes since object-position is percentage-based, not pixel-based).
-- ---------------------------------------------------------------------------
alter table public.content_blocks
  add column focal_x numeric not null default 50 check (focal_x >= 0 and focal_x <= 100),
  add column focal_y numeric not null default 50 check (focal_y >= 0 and focal_y <= 100),
  add column zoom    numeric not null default 1.0 check (zoom >= 1.0 and zoom <= 3.0);

alter table public.team_members
  add column focal_x numeric not null default 50 check (focal_x >= 0 and focal_x <= 100),
  add column focal_y numeric not null default 50 check (focal_y >= 0 and focal_y <= 100),
  add column zoom    numeric not null default 1.0 check (zoom >= 1.0 and zoom <= 3.0);

alter table public.carousel_images
  add column focal_x numeric not null default 50 check (focal_x >= 0 and focal_x <= 100),
  add column focal_y numeric not null default 50 check (focal_y >= 0 and focal_y <= 100),
  add column zoom    numeric not null default 1.0 check (zoom >= 1.0 and zoom <= 3.0);

alter table public.gallery_photos
  add column focal_x numeric not null default 50 check (focal_x >= 0 and focal_x <= 100),
  add column focal_y numeric not null default 50 check (focal_y >= 0 and focal_y <= 100),
  add column zoom    numeric not null default 1.0 check (zoom >= 1.0 and zoom <= 3.0);
