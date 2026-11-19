import Link from "next/link";
import { gamesIndexHref, type WinnerFilter as Winner } from "@/lib/games/index-href";
import type { Facets } from "@/lib/games/index-facets";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Winner; label: string; dot?: string }[] = [
  { value: null, label: "All" },
  { value: "gotm", label: "GOTM winners", dot: "bg-gotm" },
  { value: "nr_gotm", label: "NR winners", dot: "bg-nr" },
];

// All / GOTM winners / NR winners. A segmented control of links, so each
// filter is a URL; switching keeps the search and the facets and starts
// from page one.
export function WinnerFilter({ current, q, facets }: { current: Winner; q: string; facets: Facets }) {
  return (
    <nav
      aria-label="Filter by winners"
      className="flex w-full overflow-hidden rounded-sm border border-border-strong sm:w-auto"
    >
      {OPTIONS.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value ?? "all"}
            href={gamesIndexHref({ q, winner: option.value, facets })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "font-label inline-flex h-11 flex-1 items-center justify-center gap-2 border-l border-border-strong px-2.5 text-[0.82rem] font-extrabold tracking-[0.06em] whitespace-nowrap transition-colors first:border-l-0 sm:flex-none sm:px-3.5 sm:text-[0.92rem]",
              active
                ? "bg-foreground text-background"
                : "text-dim-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.dot && (
              <span
                aria-hidden
                className={cn("size-2.25 rounded-full", option.dot)}
              />
            )}
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
