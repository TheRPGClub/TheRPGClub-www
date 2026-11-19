"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { gamesIndexHref, type WinnerFilter } from "@/lib/games/index-href";
import type { FacetKey, FacetOption, Facets } from "@/lib/games/index-facets";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// One facet of the game index (Genre, Platform, …): pick any number of its
// values and the grid keeps the games with one of them. Each pick changes
// the address at once (no Apply step), keeping the search, the winner
// filter and the other facets, and starts from page one. The release
// calendar's platform filter, for the GameDB.
export function FacetFilter({
  facet,
  label,
  options,
  q,
  winner,
  facets,
}: {
  facet: FacetKey;
  label: string;
  options: FacetOption[];
  q: string;
  winner: WinnerFilter;
  facets: Facets;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = facets[facet].map(String);
  const [value, setValue] = useState(current);
  // Another control (Clear filters, back/forward) changed the address.
  const key = current.join(",");
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setValue(current);
  }
  const items = Object.fromEntries(options.map((o) => [String(o.id), o.name]));

  const change = (next: string[]) => {
    setValue(next);
    const href = gamesIndexHref({ q, winner, facets: { ...facets, [facet]: next.map(Number) } });
    startTransition(() => router.push(href, { scroll: false }));
  };

  return (
    <Select multiple items={items} value={value} onValueChange={change}>
      <SelectTrigger
        aria-label={label}
        aria-busy={pending}
        className={cn("h-9 min-w-0 flex-1 basis-36 gap-2 px-3 sm:flex-none", pending && "opacity-70")}
      >
        <SelectValue className="min-w-0 gap-2 overflow-hidden">
          {(picked: string[]) => (
            <>
              <span>{label}:</span>
              {picked.length === 0 ? (
                <span>All</span>
              ) : (
                <>
                  <Badge tone="inverse" size="sm" className="min-w-0 truncate">
                    {items[picked[0]] ?? "Unknown"}
                  </Badge>
                  {picked.length > 1 && <span>+{picked.length - 1}</span>}
                </>
              )}
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} className="max-h-80 min-w-56">
        {options.map((o) => (
          <SelectItem key={o.id} value={String(o.id)}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
