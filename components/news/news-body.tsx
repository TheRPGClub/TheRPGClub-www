import { notFound } from "next/navigation";
import { fetchCatchup, fetchNewsCategories, fetchNewsStamp } from "@/lib/api/news";
import { categoryNames, newsCategoryRows, newsHref, type NewsFilters } from "@/lib/news";
import { agoLabel, markOf } from "@/lib/news-catchup";
import { newestShown } from "@/lib/news-mark";
import { NewsCatchup } from "./news-catchup";
import { NewsNote } from "./news-empty";
import { NewsLiveRefresh } from "./news-live-refresh";
import { NewsMarkAllSeen } from "./news-mark-all-seen";
import { NewsMarkBeacon } from "./news-mark-beacon";
import { NewsMasthead } from "./news-masthead";
import { NewsShowAll } from "./news-show-all";

// The News page's body once the member is let in: Catch-up (spec api#494,
// ticket www#221). The feed is read twice, page one of the whole view (the
// hero, the mosaic, and the member's News Mark with its new counts) and the
// page of Seen rows; Show all reads only the new list.

export async function NewsBody({
  filters,
  userId,
  badge,
}: {
  filters: NewsFilters;
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
  const newest = (top ?? rows)?.items[0];
  // Without the feed the member's switched-off categories are unknown, so
  // the Categories control shows no counts and claims nothing about them.
  const categoryRows = newsCategoryRows(
    categories,
    filters,
    meta?.category_counts ?? null,
    ok ? (meta?.hidden_categories ?? []) : null,
  );

  // Leaving moves the News Mark to the newest item shown (www#222).
  const shown = ok ? newestShown(top?.meta, top?.items ?? null, rows.items, filters) : null;

  return (
    <div className="space-y-6">
      <NewsLiveRefresh stamp={stamp} page={filters.page} />
      {ok && <NewsMarkBeacon newest={shown} mark={markOf(meta)} />}
      <NewsMasthead
        badge={badge}
        updated={newest ? `Updated ${agoLabel(newest.posted_at, now)}` : null}
        rows={categoryRows}
        filters={filters}
        tab="catchup"
        markAllSeen={ok && <NewsMarkAllSeen back={newsHref(filters, { since: null, page: 1 })} />}
      />
      {!ok ? (
        <NewsNote>Couldn&apos;t load the news. Try again in a moment.</NewsNote>
      ) : filters.since ? (
        <NewsShowAll page={rows} filters={filters} nameOf={nameOf} now={now} />
      ) : (
        <NewsCatchup top={top!} rows={rows} filters={filters} nameOf={nameOf} now={now} />
      )}
      {newest && (
        <p className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">
          Days and times in UTC
        </p>
      )}
    </div>
  );
}
