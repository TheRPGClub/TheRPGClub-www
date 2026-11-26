import Link from "next/link";
import {
  formatPlaytime,
  shelfSortHref,
  type ShelfKey,
  type ShelfSort,
  type ShelfSorts,
} from "@/lib/members/profile-playtime";
import { cn } from "@/lib/utils";

// Under a shelf's label: its Playtime total (each game counted once), then
// its sort, the shelf's own order or Most played. The total is left off when
// the API doesn't send it; the sort, without an `ownOrder` (the Backlog).
export function ShelfPlaytimeHead({
  userId,
  shelf,
  label,
  minutes,
  sorts,
  ownOrder,
}: {
  userId: string;
  shelf: ShelfKey;
  label: string;
  minutes: number | undefined;
  sorts: ShelfSorts;
  // The shelf's own order's name: "Newest", "Ranked". None: no sort.
  ownOrder?: string;
}) {
  const options: [ShelfSort, string][] = ownOrder
    ? [
        ["default", ownOrder],
        ["most_played", "Most played"],
      ]
    : [];
  return (
    <div className="flex basis-full items-end justify-between gap-3 sm:basis-auto sm:flex-col sm:items-start sm:gap-1.5">
      {minutes !== undefined && (
        <p className="font-headline text-[1.6rem] leading-[0.9] sm:text-[1.9rem]">
          {formatPlaytime(minutes)}
          <span className="font-label mt-[3px] block text-[0.72rem] leading-tight font-bold tracking-[0.08em] text-faint-foreground">
            Playtime
          </span>
        </p>
      )}
      {options.length > 0 && (
        <div
          role="group"
          aria-label={`Sort ${label}`}
          className="inline-flex gap-0.5"
        >
          {options.map(([sort, name]) => {
            const on = sorts[shelf] === sort;
            return (
              <Link
                key={sort}
                href={shelfSortHref(userId, sorts, shelf, sort)}
                scroll={false}
                replace
                aria-current={on ? "true" : undefined}
                className={cn(
                  "font-label rounded-xs px-1.5 py-[5px] text-[0.74rem] leading-none font-extrabold tracking-[0.07em] transition-colors",
                  on
                    ? "bg-foreground text-background"
                    : "text-faint-foreground hover:text-highlight",
                )}
              >
                {name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
