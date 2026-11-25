import Link from "next/link";
import { ArrowDownUp } from "lucide-react";
import {
  GOTM_KIND_OPTIONS,
  gotmHistoryHref,
  type GotmHistoryFilters as Filters,
  type GotmKind,
} from "@/lib/api/gotm-rounds";
import { cn } from "@/lib/utils";

// The GOTM History's Category switch (Both / GOTM / NR-GOTM) and its order,
// as links beside the page title. Each keeps the year and starts from the
// first page. There is no title search on this page.

const KIND_SWATCH: Partial<Record<GotmKind, string>> = {
  gotm: "bg-gotm",
  nr_gotm: "bg-nr",
};

export function GotmHistoryFilters({ filters }: { filters: Filters }) {
  const href = (change: Partial<Filters>) =>
    gotmHistoryHref({ ...filters, ...change, page: 1 });
  const oldestFirst = filters.sort === "asc";

  return (
    <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2.5 sm:w-auto">
      <nav
        aria-label="Category"
        className="flex flex-1 basis-full overflow-hidden rounded-sm border border-border sm:flex-none sm:basis-auto"
      >
        {GOTM_KIND_OPTIONS.map((option) => {
          const active = option.value === filters.kind;
          const swatch = KIND_SWATCH[option.value];
          return (
            <Link
              key={option.value}
              href={href({ kind: option.value })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "font-label flex flex-1 items-center justify-center gap-2 border-r border-border px-2 py-2.25 text-[0.82rem] whitespace-nowrap sm:px-4 font-semibold tracking-[0.12em] uppercase transition-colors last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight sm:flex-none",
                active
                  ? "bg-highlight text-highlight-foreground"
                  : "text-dim-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {swatch && (
                <span aria-hidden className={cn("size-2 shrink-0 rounded-[1px]", swatch)} />
              )}
              {option.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href={href({ sort: oldestFirst ? "desc" : "asc" })}
        className="font-label inline-flex items-center gap-1.5 py-2 text-[0.82rem] font-semibold tracking-[0.12em] text-dim-foreground uppercase transition-colors hover:text-highlight"
      >
        <ArrowDownUp aria-hidden className="size-3.5" />
        {oldestFirst ? "Oldest first" : "Newest first"}
        <span className="sr-only">, switch to {oldestFirst ? "newest" : "oldest"} first</span>
      </Link>
    </div>
  );
}
