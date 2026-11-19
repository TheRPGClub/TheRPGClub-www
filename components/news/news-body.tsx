import { notFound } from "next/navigation";
import { fetchNews, fetchNewsCategories, fetchNewsNeighbours, fetchNewsStamp } from "@/lib/api/news";
import { paginationOf } from "@/lib/api/pagination";
import {
  categoryNames,
  countNote,
  dayRunsOver,
  groupNewsByDay,
  newsCategoryRows,
  newsHref,
  type NewsFilters,
} from "@/lib/news";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { NewsCategoryRail } from "./news-category-rail";
import { NewsDayBand } from "./news-day-band";
import { NewsEmpty, NewsNote } from "./news-empty";
import { NewsLiveRefresh } from "./news-live-refresh";

// The News page's body once the member is let in: the feed, the category
// list and the items either side of this page, read together, set as day
// bands beside the category rail.

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
  const [result, categories, neighbours] = await Promise.all([
    fetchNews(filters, userId, stamp),
    fetchNewsCategories(),
    fetchNewsNeighbours(filters, userId, stamp),
  ]);
  // The flag changed after the page's gate ran.
  if (result === "not_found") notFound();

  const items = result?.items ?? [];
  const { total, totalPages } = paginationOf(result?.meta ?? undefined, items.length);
  // An old or hand-edited address past the last page.
  const pastEnd = result !== null && filters.page > totalPages;
  const note = result ? countNote(total, filters.page, totalPages) : null;
  const nameOf = categoryNames(categories);
  const now = new Date();
  const meta = result?.meta;
  // Without the feed the member's switched-off categories are unknown, so
  // the rail shows no counts and claims nothing about them.
  const rows = newsCategoryRows(
    categories,
    filters,
    meta?.category_counts ?? null,
    result ? (meta?.hidden_categories ?? []) : null,
  );

  return (
    <div className="space-y-6">
      <NewsLiveRefresh stamp={stamp} page={filters.page} />
      <PageHeader
        title="News"
        badge={badge}
        actions={
          note && (
            <p className="font-label text-sm tracking-[0.08em] text-faint-foreground">{note}</p>
          )
        }
      />
      <div className="gap-x-7 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <NewsCategoryRail rows={rows} filters={filters} />
        <div className="@container min-w-0 space-y-8 max-lg:mt-5">
          {!result ? (
            <NewsNote>Couldn&apos;t load the news. Try again in a moment.</NewsNote>
          ) : items.length === 0 ? (
            <NewsEmpty
              filters={filters}
              lastPage={pastEnd ? totalPages : null}
              nameOf={nameOf}
              // Items the member's default view leaves out (their
              // switched-off categories), for the empty default view.
              elsewhere={Object.values(meta?.category_counts ?? {}).some((n) => n > 0)}
            />
          ) : (
            groupNewsByDay(items).map((day, i, days) => (
              <NewsDayBand
                key={day.day}
                day={day}
                // A day running over a page break shows no tally: this page
                // holds only part of it.
                partial={
                  (i === 0 && dayRunsOver(day.day, neighbours.before)) ||
                  (i === days.length - 1 && dayRunsOver(day.day, neighbours.after))
                }
                now={now}
                nameOf={nameOf}
              />
            ))
          )}
          {/* Past the end, the empty state leads back instead. */}
          {!pastEnd && (
            <ListPagination
              currentPage={filters.page}
              totalPages={totalPages}
              buildHref={(page) => newsHref(filters, { page })}
            />
          )}
          {items.length > 0 && (
            <p className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">
              Days and times in UTC
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
