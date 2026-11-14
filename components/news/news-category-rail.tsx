"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { hasNewsFilters, type NewsCategoryRow, type NewsFilters } from "@/lib/news";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NewsFilter } from "./news-filter";

// The News page's category rail: a 15.5rem column beside the grid from `lg`,
// and a "Filter" disclosure above the grid below it, both holding the same
// filter (the search field, the News Categories as toggles with their counts
// or "hidden by you", and "Show all categories"). The disclosure starts open
// while a filter or search is on, so a phone shows what narrowed the page;
// after that it stays as the member leaves it, also when a choice inside it
// clears the filter.

export function NewsCategoryRail({
  rows,
  filters,
}: {
  rows: NewsCategoryRow[];
  filters: NewsFilters;
}) {
  // Seeded once: the rail stays mounted across the filter's soft navigations.
  const [open, setOpen] = useState(() => hasNewsFilters(filters));
  return (
    <>
      <aside className="hidden lg:sticky lg:top-[84px] lg:block lg:self-start">
        <NewsFilter rows={rows} filters={filters} headingId="news-categories-rail" />
      </aside>
      <Collapsible open={open} onOpenChange={setOpen} className="mb-1 lg:hidden">
        <CollapsibleTrigger
          render={<Button type="button" variant="outline" />}
          className="group/filter cursor-pointer"
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          Filter
          <ChevronDown
            aria-hidden
            className="size-4 text-faint-foreground motion-safe:transition-transform group-data-panel-open/filter:rotate-180"
          />
        </CollapsibleTrigger>
        {/* Kept mounted while closed, as the disclosure kept its search. */}
        <CollapsibleContent keepMounted className="mt-3 max-w-md">
          <NewsFilter rows={rows} filters={filters} headingId="news-categories-filter" />
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
