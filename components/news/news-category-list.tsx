"use client";

import Link from "next/link";
import { NEWS_PATH, newsHref, type NewsCategoryRow, type NewsFilters } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NewsCategoryToggle } from "./news-category-toggle";

// The Categories control's list: the News Categories as toggles with their
// counts (or "hidden by you"), and "Show all categories". A plain GET form
// on /news, so it works before hydration; once hydrated it pushes the
// canonical address (`go`) instead, without scrolling.

const FOCUS = "outline-none focus-visible:ring-3 focus-visible:ring-highlight/50";

export function NewsCategoryList({
  rows,
  filters,
  headingId,
  go,
}: {
  rows: NewsCategoryRow[];
  filters: NewsFilters;
  headingId: string;
  go: (href: string) => void;
}) {
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="font-label mb-1.5 text-[0.8rem] tracking-[0.08em] text-faint-foreground">
        News Categories
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-dim-foreground">Couldn&apos;t load the News Categories. Search still works.</p>
      ) : (
        <form
          action={NEWS_PATH}
          method="get"
          onSubmit={(event) => {
            const submitter = (event.nativeEvent as SubmitEvent).submitter;
            const href = submitter?.dataset.href;
            if (!href) return;
            event.preventDefault();
            go(href);
          }}
        >
          {filters.q && <Input type="hidden" name="q" value={filters.q} />}
          <ul>
            {rows.map((row) => (
              <li key={row.key} className="border-b border-border">
                <NewsCategoryToggle row={row} />
              </li>
            ))}
          </ul>
        </form>
      )}
      {filters.categories.length > 0 && (
        <Link
          href={newsHref(filters, { categories: [] })}
          scroll={false}
          onClick={(event) => {
            event.preventDefault();
            go(newsHref(filters, { categories: [] }));
          }}
          className={cn(
            "font-label mt-3 inline-block rounded-xs text-[0.8rem] text-dim-foreground underline decoration-gotm decoration-2 underline-offset-4 transition-colors hover:text-highlight",
            FOCUS,
          )}
        >
          Show all categories
        </Link>
      )}
    </section>
  );
}
