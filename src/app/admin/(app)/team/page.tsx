import { requireAdmin } from "@/lib/admin/auth";
import { ToastHost } from "@/lib/admin/toast";
import TeamEditor, { type TeamMemberRow } from "./TeamEditor";

export default async function TeamPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("team_members")
    .select(
      "id,sort_order,name,role_de,role_en,role_fr,extra_de,extra_en,extra_fr,photo_path,photo_path_thumb,photo_path_medium,focal_x,focal_y,zoom,visible"
    )
    .order("sort_order");

  const initialMembers: TeamMemberRow[] = (data as TeamMemberRow[] | null) ?? [];

  return (
    <ToastHost>
      <TeamEditor initialMembers={initialMembers} />
    </ToastHost>
  );
}
