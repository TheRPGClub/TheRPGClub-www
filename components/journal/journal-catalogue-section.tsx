import { memberName } from "@/lib/achievements";
import {
  archiveHref,
  archiveParams,
  type ArchiveQuery,
  type JournalArchive,
} from "@/lib/journals/archive-page";
import { ListPagination } from "@/components/list-pagination";
import { SectionHeading } from "@/components/templates/page-header";
import { JournalCatalogue } from "@/components/journal/journal-catalogue";
import { JournalCatalogueFilters } from "@/components/journal/journal-catalogue-filters";
import { JournalNotice } from "@/components/journal/journal-notice";

// /journals' catalogue: the search across every entry, its filters, and a
// page of matching entries.
export function JournalCatalogueSection({ archive, query }: { archive: JournalArchive; query: ArchiveQuery }) {
  const { results, filtered, filterGameTitle } = archive;
  const found = results?.meta.count ?? 0;
  return (
    <section id="catalogue" aria-labelledby="journal-catalogue" className="scroll-mt-20">
      <SectionHeading title={<span id="journal-catalogue">Catalogue</span>} count="Search every entry" />
      <div data-slot="journal-catalogue-body">
        <JournalCatalogueFilters
          q={query.q}
          by={query.by}
          game={query.gameId ? { id: query.gameId, title: filterGameTitle } : null}
          members={(archive.people ?? []).map((c) => ({ id: c.user_id, name: memberName(c) }))}
          resultLabel={results ? `${found} ${found === 1 ? "entry" : "entries"}` : ""}
          current={archiveParams(query)}
        />
        {results === null ? (
          <JournalNotice centered className="mt-4">
            The catalogue couldn&apos;t be searched right now.
          </JournalNotice>
        ) : results.data.length === 0 ? (
          <JournalNotice className="mt-4">{filtered ? "No entries match that search." : "No entries yet."}</JournalNotice>
        ) : (
          <>
            <JournalCatalogue entries={results.data} q={query.q} />
            <div data-slot="community-pager" className="mt-5">
              <ListPagination
                currentPage={results.meta.page}
                totalPages={results.meta.pages}
                buildHref={(p) => archiveHref(query, { page: p > 1 ? String(p) : null }, "#catalogue")}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
