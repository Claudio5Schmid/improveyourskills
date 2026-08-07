import { requireAdmin } from "@/lib/admin/auth";
import { ToastHost } from "@/lib/admin/toast";
import GalerieEditor, { type AdminPhoto } from "./GalerieEditor";

const SIGNED_URL_TTL = 60 * 60 * 2; // 2h — comfortably covers one working session

interface PhotoRow {
  id: string;
  year: number;
  sort_order: number;
  hidden: boolean;
  path_thumb: string;
}

export default async function GaleriePage() {
  const { supabase } = await requireAdmin();

  const [{ data: photoRows }, { data: settings }] = await Promise.all([
    supabase
      .from("gallery_photos")
      .select("id,year,sort_order,hidden,path_thumb")
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("current_edition_year").maybeSingle(),
  ]);

  const rows = (photoRows as PhotoRow[] | null) ?? [];

  // Signed URLs so the admin can preview HIDDEN photos too (the public
  // /api/foto/ route only ever serves hidden = false, by design). One batch
  // call regardless of how many photos exist. Signed URLs stay valid for
  // their TTL independent of later hidden-flag changes, so toggling
  // visibility in the UI below never needs to re-sign anything.
  const paths = rows.map((r) => r.path_thumb);
  const { data: signed } = paths.length
    ? await supabase.storage.from("gallery").createSignedUrls(paths, SIGNED_URL_TTL)
    : { data: [] as { path: string | null; signedUrl: string }[] };
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  const photos: AdminPhoto[] = rows.map((r) => ({
    id: r.id,
    year: r.year,
    sortOrder: r.sort_order,
    hidden: r.hidden,
    thumbUrl: urlByPath.get(r.path_thumb) ?? null,
  }));

  const currentEditionYear = settings?.current_edition_year ?? new Date().getFullYear();

  return (
    <ToastHost>
      <GalerieEditor initialPhotos={photos} currentEditionYear={currentEditionYear} />
    </ToastHost>
  );
}
