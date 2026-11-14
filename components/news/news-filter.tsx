"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { NEWS_PATH, newsHref, type NewsCategoryRow, type NewsFilters } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NewsCategoryToggle } from "./news-category-toggle";
import { NewsSearchField } from "./news-search-field";

// The rail's filter: the search field, the News Categories as toggles, and
// "Show all categories". The search stays when the category list couldn't
// load; a short note takes the list's place. Both are plain GET forms on /news, so they work
// before hydration; once hydrated they push the canonical address
// (newsHref) instead, without scrolling, and dim while the page loads.

const FOCUS =
  "outline-none focus-visible:ring-3 focus-visible:ring-highlight/50";

export function NewsFilter({
  rows,
  filters,
  headingId,
}: {
  rows: NewsCategoryRow[];
  filters: NewsFilters;
  headingId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = (href: string) =>
    startTransition(() => router.push(href, { scroll: false }));

  return (
    <div
      aria-busy={pending}
      className={cn("transition-opacity duration-150", pending && "opacity-60")}
    >
      <NewsSearchField filters={filters} go={go} />
      <section aria-labelledby={headingId} className="mt-[18px]">
        <h2
          id={headingId}
          className="font-label mb-1.5 text-[0.8rem] tracking-[0.08em] text-faint-foreground"
        >
          News Categories
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-dim-foreground">
            Couldn&apos;t load the News Categories. Search still works.
          </p>
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
            className={cn(
              "font-label mt-3 inline-block rounded-xs text-[0.8rem] text-dim-foreground underline decoration-gotm decoration-2 underline-offset-4 transition-colors hover:text-highlight",
              FOCUS,
            )}
          >
            Show all categories
          </Link>
        )}
      </section>
    </div>
  );
}
