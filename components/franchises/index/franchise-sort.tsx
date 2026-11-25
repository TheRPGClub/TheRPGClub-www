"use client";

import { useRouter } from "next/navigation";
import {
  FRANCHISE_SORTS,
  browseHref,
  type BrowseQuery,
  type FranchiseSort,
} from "@/lib/franchises/browse";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Sort: A–Z | Most games | Club plays, kept in the URL's `sort`. A change
// keeps the search or letter and starts again from page one.
export function FranchiseSortSwitch({ query }: { query: BrowseQuery }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 sm:ml-auto">
      <span
        id="franchise-sort"
        className="font-label text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground"
      >
        Sort
      </span>
      <ToggleGroup
        aria-labelledby="franchise-sort"
        variant="outline"
        size="lg"
        spacing={0}
        value={[query.sort]}
        onValueChange={(next) => {
          const sort = next[0] as FranchiseSort | undefined;
          if (sort && sort !== query.sort)
            router.push(browseHref({ ...query, sort, page: 1 }), {
              scroll: false,
            });
        }}
      >
        {FRANCHISE_SORTS.map(([value, label]) => (
          <ToggleGroupItem key={value} value={value} className="px-3">
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
