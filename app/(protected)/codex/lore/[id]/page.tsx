import { notFound } from "next/navigation";
import { requireFeature } from "@/lib/session";
import { fetchCodexEntry, fetchLinkedEntries } from "@/lib/api/codex";
import { readStory } from "@/lib/codex/lore-story";
import { visibleLinks } from "@/lib/codex/see-also";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { LoreEntryView } from "@/components/codex/lore/lore-entry-view";
import { SeeAlsoBand } from "@/components/codex/lore/see-also-band";

// A Lore Entry's page (www#125, design 3D), closing on its See also band
// (www#127), each linked entry read in full for its Kind, date or author.
// Members only; not found for non-staff in Preview and for everyone when Off.
export default async function LoreEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const features = await requireFeature("club_codex");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const entry = await fetchCodexEntry("lore_entry", id);
  if (entry === "not_found") notFound();
  if (entry === null) throw new Error("The Lore Entry couldn't be read.");
  const linked = await fetchLinkedEntries(visibleLinks(entry.links, false));
  return (
    <LoreEntryView
      entry={entry}
      story={readStory(entry)}
      badge={features.preview("club_codex") && <PreviewBadge />}
      seeAlso={<SeeAlsoBand items={linked} />}
    />
  );
}
