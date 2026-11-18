import { notFound, redirect } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { fetchCodexEntry } from "@/lib/api/codex";
import { readStory } from "@/lib/codex/lore-story";
import { LORE_PATH } from "@/lib/codex/paths";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { LoreDesk } from "@/components/codex/desk/lore-desk";
import { LoreAuthor } from "@/components/codex/lore/lore-author";

// Editing a Lore Entry at the desk (www#125, design 5D): its author, or a
// Moderator and above, as the entry's `viewer` says. The byline keeps the
// author.
export default async function EditLoreEntryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const features = await requireFeature("club_codex");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const entry = await fetchCodexEntry("lore_entry", id);
  if (entry === "not_found") notFound();
  if (entry === null) throw new Error("The Lore Entry couldn't be read.");
  if (!entry.viewer.can_edit) redirect(`${LORE_PATH}/${id}`);
  return (
    <LoreDesk
      entry={entry}
      initialValue={readStory(entry)}
      author={<LoreAuthor member={entry.author} />}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
