import { notFound } from "next/navigation";
import { fetchCatchup, fetchNewsCategories, fetchNewsStamp } from "@/lib/api/news";
import { categoryNames, newsCategoryRows, newsHref, visitMarkHref, type NewsFilters } from "@/lib/news";
import { agoLabel, newestPosted } from "@/lib/news-catchup";
import { beaconEligible, newestShown } from "@/lib/news-mark";
import { NewsCatchup } from "./news-catchup";
import { NewsNote } from "./news-empty";
import { NewsLiveRefresh } from "./news-live-refresh";
import { NewsMarkAllSeen } from "./news-mark-all-seen";
import { NewsMarkBeacon } from "./news-mark-beacon";
import { NewsMasthead } from "./news-masthead";
import { NewsShowAll } from "./news-show-all";
import { NewsVisitMark } from "./news-visit-mark";

// The News page's body once the member is let in: Catch-up (spec api#494,
// ticket www#221). The feed is read twice, page one of the whole view (the
// hero, the mosaic, and the member's News Mark with its new counts) and the
// page of Seen items; Show all reads only the new list. The visit's mark
// rides in the address (`?mark=`, fix pass): a new visit reads the stored
// one and puts it there.

export async function NewsBody({
  filters,
  markInAddress,
  userId,
  badge,
}: {
  filters: NewsFilters;
  // The address's raw `mark`, to tell a bad one (dropped) from none.
  markInAddress: string | undefined;
  userId: string;
  badge: React.ReactNode;
}) {
  // The stamp first: an item recorded between it and the feed only makes the
  // page's next poll re-read it, never leaves it behind.
  const stamp = await fetchNewsStamp();
  const [read, categories] = await Promise.all([
    fetchCatchup(filters, userId, stamp),
    fetchNewsCategories(),
  ]);
  // The flag changed after the page's gate ran.
  if (read.top === "not_found" || read.rows === "not_found") notFound();

  const { top, rows } = read;
  const ok = rows !== null && (filters.since !== null || top !== null);
  const meta = top?.meta ?? rows?.meta ?? null;
  const nameOf = categoryNames(categories);
  const now = new Date();
  // "Updated" is the newest of page one's reads; a later page has only part
  // of the view, so it says nothing.
  const newest = filters.page === 1 ? newestPosted([top?.items[0], rows?.items[0]]) : null;
  const visitMark = filters.mark ?? read.stored;
  // Without the feed the member's switched-off categories are unknown, so
  // the Categories control shows no counts and claims nothing about them.
  const categoryRows = newsCategoryRows(
    categories,
    filters,
    meta?.category_counts ?? null,
    ok ? (meta?.hidden_categories ?? []) : null,
  );

  // Leaving moves the News Mark to the newest item the unfiltered views
  // showed over the visit (www#222, fix pass).
  const shown =
    ok && beaconEligible(filters) ? newestShown(top?.meta, top?.items ?? null, rows.items, filters) : null;

  return (
    <div className="space-y-6">
      <NewsLiveRefresh stamp={stamp} page={filters.page} />
      <NewsVisitMark href={visitMarkHref(filters, markInAddress, read.stored)} />
      {ok && <NewsMarkBeacon shown={shown} mark={visitMark} />}
      <NewsMasthead
        badge={badge}
        updated={newest ? `Updated ${agoLabel(newest.posted_at, now)}` : null}
        rows={categoryRows}
        filters={filters}
        tab="catchup"
        markAllSeen={ok && <NewsMarkAllSeen back={newsHref(filters, { since: null, page: 1, mark: null })} />}
      />
      {!ok ? (
        <NewsNote>Couldn&apos;t load the news. Try again in a moment.</NewsNote>
      ) : filters.since ? (
        <NewsShowAll page={rows} filters={filters} nameOf={nameOf} now={now} />
      ) : (
        <NewsCatchup top={top!} rows={rows} filters={filters} nameOf={nameOf} now={now} />
      )}
      {ok && (top?.items.length || rows.items.length) ? (
        <p className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">
          Days and times in UTC
        </p>
      ) : null}
    </div>
  );
}
