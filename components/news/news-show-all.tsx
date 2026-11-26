import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { paginationOf } from "@/lib/api/pagination";
import type { NewsPage } from "@/lib/api/news";
import { newsHref, type NewsFilters } from "@/lib/news";
import { sinceLabel } from "@/lib/news-catchup";
import { ListPagination } from "@/components/list-pagination";
import { headingLinkClass, SectionHeading } from "@/components/templates/page-header";
import { NewsEmpty, NewsNote } from "./news-empty";
import { NewsMosaic } from "./news-mosaic";

// Show all: every News Item new since the mark the page was read with
// (`?since=`), in the mosaic's grammar, a page at a time, with the way back
// to Catch-up.

export function NewsShowAll({
  page,
  filters,
  nameOf,
  now,
}: {
  page: NewsPage;
  filters: NewsFilters;
  nameOf: (key: string | null) => string;
  now: Date;
}) {
  const { total, totalPages } = paginationOf(page.meta ?? undefined, page.items.length);
  const back = newsHref(filters, { since: null, page: 1 });
  return (
    <div className="space-y-5">
      <SectionHeading
        title={`${total} new`}
        count={filters.since ? `since ${sinceLabel(filters.since, now)}` : null}
        action={
          <Link href={back} className={headingLinkClass}>
            <ArrowLeft aria-hidden />
            Back to Catch-up
          </Link>
        }
      />
      {page.items.length === 0 && filters.page === 1 ? (
        <NewsNote>Nothing new since then.</NewsNote>
      ) : page.items.length === 0 ? (
        <NewsEmpty
          filters={filters}
          lastPage={filters.page > totalPages ? totalPages : null}
          nameOf={nameOf}
          elsewhere={false}
        />
      ) : (
        <NewsMosaic items={page.items} nameOf={nameOf} now={now} label="New items" />
      )}
      <ListPagination
        currentPage={filters.page}
        totalPages={totalPages}
        buildHref={(n) => newsHref(filters, { page: n })}
      />
    </div>
  );
}
