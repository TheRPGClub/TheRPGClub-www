import { paginationOf } from "@/lib/api/pagination";
import type { NewsPage } from "@/lib/api/news";
import { newsHref, type NewsFilters } from "@/lib/news";
import { inkSegments, sinceLabel, splitCatchup } from "@/lib/news-catchup";
import { ListPagination } from "@/components/list-pagination";
import { NewsEmpty } from "./news-empty";
import { NewsHeroBand } from "./news-hero-band";
import { NewsMosaic } from "./news-mosaic";
import { NewsSeenRule } from "./news-seen";

// Catch-up: the hero band (the new count and the newest item as art), the
// mosaic of up to nine further new items, then the Seen rule over the
// earlier items as the same mosaic without new dots, paginated. Later pages
// hold the Seen mosaic alone.

export function NewsCatchup({
  top,
  rows,
  filters,
  nameOf,
  now,
}: {
  top: NewsPage;
  rows: NewsPage;
  filters: NewsFilters;
  nameOf: (key: string | null) => string;
  now: Date;
}) {
  const catchup = splitCatchup(top.meta, top.items, rows.items, filters.page);
  const { totalPages } = paginationOf(rows.meta ?? undefined, rows.items.length);
  const since = catchup.mark ? sinceLabel(catchup.mark, now) : null;
  const more =
    catchup.moreNew > 0 && catchup.mark
      ? { count: catchup.moreNew, href: newsHref(filters, { since: catchup.mark, page: 1 }) }
      : null;

  if (!catchup.hero && catchup.seen.length === 0) {
    return (
      <NewsEmpty
        filters={filters}
        lastPage={filters.page > totalPages ? totalPages : null}
        nameOf={nameOf}
        // Items the member's default view leaves out (their switched-off
        // categories), for the empty default view.
        elsewhere={Object.values(top.meta?.category_counts ?? {}).some((n) => n > 0)}
      />
    );
  }
  return (
    <div data-slot="news-catchup" className="space-y-3">
      {catchup.hero && (
        <NewsHeroBand
          catchup={catchup}
          hero={catchup.hero}
          since={since}
          segments={inkSegments(catchup.newByCategory, nameOf)}
          nameOf={nameOf}
          now={now}
        />
      )}
      <NewsMosaic items={catchup.mosaic} nameOf={nameOf} now={now} label="More new items" />
      {(catchup.seen.length > 0 || more) && (
        <section className="space-y-3 pt-3">
          <NewsSeenRule more={more} />
          <NewsMosaic items={catchup.seen} nameOf={nameOf} now={now} label="Seen items" fresh={false} />
        </section>
      )}
      <div data-slot="community-pager" className="pt-3">
        <ListPagination
          currentPage={filters.page}
          totalPages={totalPages}
          buildHref={(page) => newsHref(filters, { page })}
        />
      </div>
    </div>
  );
}
