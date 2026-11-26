"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { newsInk, type NewsCategoryRow, type NewsFilters } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InkSquare } from "./ink-square";
import { NewsCategoryList } from "./news-category-list";
import { NewsSearchField } from "./news-search-field";

// The masthead's tools: the search, the Categories control (a popover over
// the News Categories with ink squares and counts, "hidden by you" and
// "Show all categories") and the Mark all seen slot. Choosing and searching
// go through the page address without scrolling, and the tools dim while
// the page loads.

export function NewsTools({
  rows,
  filters,
  markAllSeen,
}: {
  rows: NewsCategoryRow[];
  filters: NewsFilters;
  // Mark all seen (ticket www#222) goes here.
  markAllSeen?: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = (href: string) => startTransition(() => router.push(href, { scroll: false }));
  const inView = rows.filter((row) => row.inView);
  const chosen = filters.categories.length;

  return (
    <div
      aria-busy={pending}
      className={cn(
        "flex w-full flex-wrap items-center gap-2.5 transition-opacity duration-150 sm:w-auto sm:flex-nowrap",
        pending && "opacity-60",
      )}
    >
      <div className="min-w-0 flex-1 sm:w-60 sm:flex-none">
        <NewsSearchField filters={filters} go={go} />
      </div>
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" />} className="cursor-pointer gap-2">
          <span aria-hidden className="flex gap-0.5">
            {inView.slice(0, 4).map((row) => (
              <InkSquare key={row.key} {...newsInk(row.key)} className="size-1.5" />
            ))}
          </span>
          <span className="font-label font-bold tracking-[0.07em] uppercase">
            Categories · {chosen ? chosen : "All"}
          </span>
          <ChevronDown aria-hidden className="size-3.5 text-faint-foreground" />
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} className="w-72 px-4 pt-3.5 pb-4">
          <NewsCategoryList rows={rows} filters={filters} headingId="news-categories" go={go} />
        </PopoverContent>
      </Popover>
      {markAllSeen}
    </div>
  );
}
