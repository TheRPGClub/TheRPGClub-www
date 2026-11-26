import { archiveHref, type ArchiveQuery, type JournalArchive } from "@/lib/journals/archive-page";
import { SectionHeading } from "@/components/templates/page-header";
import { JournalNotice } from "@/components/journal/journal-notice";
import { JournalShelf } from "@/components/journal/journal-shelf";
import { JournalVolumePreview } from "@/components/journal/journal-volume-preview";

// /journals' archive: the shelf of member volumes, with the pulled volume's
// title page beside it.
export function JournalArchiveSection({ archive, query }: { archive: JournalArchive; query: ArchiveQuery }) {
  const { people, onShelf, pulled, pulledChapters } = archive;
  return (
    <div className={pulled ? "grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]" : "grid gap-7"}>
      <section aria-labelledby="journal-archive" className="min-w-0">
        <SectionHeading
          title={<span id="journal-archive">The archive</span>}
          count="One volume per member · most games first"
        />
        {people === null ? (
          <JournalNotice centered className="mt-4">
            The archive couldn&apos;t be loaded right now.
          </JournalNotice>
        ) : people.length === 0 ? (
          <JournalNotice centered className="mt-4">
            No one has journaled a game yet. Start yours from your profile&apos;s Journal.
          </JournalNotice>
        ) : (
          <JournalShelf
            contributors={onShelf}
            pulledId={pulled?.user_id ?? null}
            hrefFor={(userId) => archiveHref(query, { vol: userId })}
            more={
              query.wholeShelf
                ? undefined
                : { count: people.length - onShelf.length, href: archiveHref(query, { shelf: "all" }) }
            }
          />
        )}
      </section>
      {pulled && <JournalVolumePreview contributor={pulled} games={pulledChapters} />}
    </div>
  );
}
