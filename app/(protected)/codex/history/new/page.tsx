import { redirect } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { isAdminOrAbove } from "@/lib/staff";
import { readDescription } from "@/lib/codex/history";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { HistoryDesk } from "@/components/codex/desk/history-desk";

// Writing a new History Event at its desk (www#126, design 5D): Admins and
// Superadmins only, as the API allows; anyone else goes back to the Club
// History.
export default async function NewHistoryEventPage() {
  const session = await requireAuth();
  const features = await requireFeature("club_codex");
  if (!isAdminOrAbove(session.membership)) redirect(HISTORY_PATH);
  return (
    <HistoryDesk
      entry={null}
      initialValue={readDescription(null)}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
