import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { fetchReviewFeed, fetchReviewFeedNeighbours } from "@/lib/api/review-feed";
import { paginationOf } from "@/lib/api/pagination";
import { dayRunsOver, feedCountNote, feedHref, groupFeedByDay, type FeedQuery } from "@/lib/reviews/feed";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { ButtonLink } from "@/components/ui/button";
import { ReviewFeedBand } from "./review-feed-band";
import { WrittenOnlyToggle } from "./written-only-toggle";

// The Review Feed's page body: "Reviews" on the rule with the count and
// Written only, the viewer's drafts row (when given), then the Reviews in
// UTC day bands, the pager and the UTC note.
export async function ReviewFeed({
  query,
  badge,
  drafts,
}: {
  query: FeedQuery;
  badge?: ReactNode;
  // The compact Your drafts row under the title (Your drafts, www#151).
  drafts?: ReactNode;
}) {
  const [result, neighbours] = await Promise.all([fetchReviewFeed(query), fetchReviewFeedNeighbours(query)]);
  // The Feature closed after the page's gate ran.
  if (result === "not_found") notFound();

  const entries = result?.entries ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, entries.length);
  // An old or hand-edited address past the last page.
  const pastEnd = result !== null && entries.length === 0 && query.page > 1;
  const now = new Date();

  return (
    <div className="@container">
      <PageHeader
        title="Reviews"
        badge={badge}
        count={result ? feedCountNote(total, query.written) : undefined}
        actions={<WrittenOnlyToggle on={query.written} href={feedHref(query, { written: !query.written, page: 1 })} />}
      />
      {drafts}
      <div className="mt-6 space-y-7 sm:mt-7.5 sm:space-y-8">
        {!result ? (
          <FeedNote>Couldn&apos;t load the reviews. Try again in a moment.</FeedNote>
        ) : entries.length === 0 ? (
          <FeedNote
            action={pastEnd && <ButtonLink href={feedHref(query, { page: 1 })} variant="outline">Back to the newest</ButtonLink>}
          >
            {pastEnd
              ? "This page is past the end of the feed."
              : query.written
                ? "No written reviews yet. Switch off Written only to see the quick takes."
                : "No reviews yet. A review shows up here once its author publishes it."}
          </FeedNote>
        ) : (
          groupFeedByDay(entries).map((day, i, days) => (
            <ReviewFeedBand
              key={day.day}
              day={day}
              partial={
                (i === 0 && dayRunsOver(day.day, neighbours.before)) ||
                (i === days.length - 1 && dayRunsOver(day.day, neighbours.after))
              }
              now={now}
              written={query.written}
            />
          ))
        )}
        {!pastEnd && (
          <ListPagination
            currentPage={query.page}
            totalPages={totalPages}
            buildHref={(page) => feedHref(query, { page })}
          />
        )}
        {entries.length > 0 && (
          <p className="font-label -mt-4 text-[0.72rem] tracking-[0.08em] text-faint-foreground">Days and times in UTC</p>
        )}
      </div>
    </div>
  );
}

// The world's empty state: a dashed strong-rule frame and one muted line.
function FeedNote({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div data-slot="shelf-empty" className="flex flex-col items-start gap-4 rounded-[2.4px] border-2 border-dashed border-border-strong px-7 py-11">
      <p className="max-w-[60ch] text-[1.02rem] text-dim-foreground">{children}</p>
      {action}
    </div>
  );
}
