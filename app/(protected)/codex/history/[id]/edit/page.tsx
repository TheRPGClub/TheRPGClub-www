import { notFound, redirect } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { fetchCodexEntry } from "@/lib/api/codex";
import { readDescription } from "@/lib/codex/history";
import { HISTORY_PATH, historyEventAnchor } from "@/lib/codex/paths";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { HistoryDesk } from "@/components/codex/desk/history-desk";

// Editing a History Event at its desk (www#126, design 5D): Admins and
// Superadmins, as the History Event's `viewer` says; anyone else goes back
// to it on the Club History.
export default async function EditHistoryEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const features = await requireFeature("club_codex");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const entry = await fetchCodexEntry("history_event", id);
  if (entry === "not_found") notFound();
  if (entry === null) throw new Error("The History Event couldn't be read.");
  if (!entry.viewer.can_edit) redirect(`${HISTORY_PATH}#${historyEventAnchor(id)}`);
  return (
    <HistoryDesk
      entry={entry}
      initialValue={readDescription(entry)}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
