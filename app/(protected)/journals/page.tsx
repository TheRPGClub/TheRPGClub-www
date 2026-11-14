import { requireAuth, requireFeature } from "@/lib/session";
import type { RawSearchParams } from "@/lib/search-params";
import { loadJournalArchive, parseArchiveQuery } from "@/lib/journals/archive-page";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader } from "@/components/templates/page-header";
import { JournalArchiveSection } from "@/components/journal/journal-archive-section";
import { JournalCatalogueSection } from "@/components/journal/journal-catalogue-section";

// Every member's Game Journal: the archive (a shelf of member volumes, most
// games journaled first, with the pulled volume's title page beside it) over
// the catalogue, a search across every entry (lib/journals/archive-page).

export default async function JournalsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAuth();
  const features = await requireFeature("journals");
  const query = parseArchiveQuery(await searchParams);
  const archive = await loadJournalArchive(query);
  const { entryTotal, contributorTotal } = archive;

  return (
    <div className="space-y-6.5">
      <PageHeader
        title="Game Journals"
        badge={features.preview("journals") && <PreviewBadge />}
        count={
          entryTotal != null
            ? `${entryTotal} ${entryTotal === 1 ? "entry" : "entries"} · ${contributorTotal} ${contributorTotal === 1 ? "contributor" : "contributors"}`
            : undefined
        }
      />
      <JournalArchiveSection archive={archive} query={query} />
      <JournalCatalogueSection archive={archive} query={query} />
    </div>
  );
}
