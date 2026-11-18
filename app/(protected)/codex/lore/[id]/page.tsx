import { notFound } from "next/navigation";
import { requireFeature } from "@/lib/session";
import { fetchCodexEntry } from "@/lib/api/codex";
import { readStory } from "@/lib/codex/lore-story";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { LoreEntryView } from "@/components/codex/lore/lore-entry-view";

// A Lore Entry's page (www#125, design 3D). Members only; not found for
// non-staff in Preview and for everyone when Off.
export default async function LoreEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const features = await requireFeature("club_codex");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const entry = await fetchCodexEntry("lore_entry", id);
  if (entry === "not_found") notFound();
  if (entry === null) throw new Error("The Lore Entry couldn't be read.");
  return (
    <LoreEntryView
      entry={entry}
      story={readStory(entry)}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
