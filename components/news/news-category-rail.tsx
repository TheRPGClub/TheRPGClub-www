import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { hasNewsFilters, type NewsCategoryRow, type NewsFilters } from "@/lib/news";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NewsFilter } from "./news-filter";

// The News page's category rail: a 15.5rem column beside the grid from `lg`,
// and a "Filter" disclosure above the grid below it, both holding the same
// filter (the search field, the News Categories as toggles with their counts
// or "hidden by you", and "Show all categories"). The disclosure starts open
// while a filter or search is on, so a phone shows what narrowed the page.

export function NewsCategoryRail({
  rows,
  filters,
}: {
  rows: NewsCategoryRow[];
  filters: NewsFilters;
}) {
  if (rows.length === 0) return null;
  return (
    <>
      <aside className="hidden lg:sticky lg:top-[84px] lg:block lg:self-start">
        <NewsFilter rows={rows} filters={filters} headingId="news-categories-rail" />
      </aside>
      <details open={hasNewsFilters(filters)} className="group/filter mb-1 lg:hidden">
        <summary
          className={cn(
            buttonVariants({ variant: "outline" }),
            "cursor-pointer list-none group-open/filter:bg-ink-3 [&::-webkit-details-marker]:hidden",
          )}
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          Filter
          <ChevronDown
            aria-hidden
            className="size-4 text-paper-mute transition-transform group-open/filter:rotate-180"
          />
        </summary>
        <div className="mt-3 max-w-md">
          <NewsFilter rows={rows} filters={filters} headingId="news-categories-filter" />
        </div>
      </details>
    </>
  );
}
