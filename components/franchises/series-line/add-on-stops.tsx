"use client";

import { useState } from "react";
import Link from "next/link";
import type { FranchiseGame } from "@/lib/franchises/types";
import { addOnsShown } from "@/lib/franchises/series-line";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// A game's Add-ons on the Series Line: yellow stops, each naming its game
// (a link). On a Mainline station ("stops") they hang down a yellow stub
// from the station (from the first width step; on a phone the stub is just
// the squares). On a Spin-off ("tags") they are small yellow tags under its
// name. Past four the rest fold into "N more", which opens them in place.
export function AddOnStops({
  games,
  parent,
  look = "stops",
  className,
}: {
  games: FranchiseGame[];
  parent: string;
  look?: "stops" | "tags";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (games.length === 0) return null;
  const shown = addOnsShown(games.length, open);
  const stops = look === "stops";
  return (
    <div className={cn("relative z-10 min-w-0", className)}>
      <ul aria-label={`Add-ons of ${parent}`} className={cn("flex flex-col", stops ? "gap-1.5" : "mt-1 gap-1")}>
        {games.slice(0, shown).map((g) => (
          <li
            key={g.game_id}
            className={cn(
              "relative flex min-w-0 items-center gap-2",
              stops &&
                "@xl/line:before:absolute @xl/line:before:top-[-6px] @xl/line:before:bottom-0 @xl/line:before:left-[3.75px] @xl/line:before:w-[2.5px] @xl/line:before:bg-highlight @xl/line:last:before:bottom-1/2",
            )}
          >
            <span aria-hidden className={cn("relative shrink-0 bg-highlight", stops ? "size-2.5" : "size-1.5")} />
            <Link
              href={`/games/${g.game_id}`}
              title={g.title}
              className={cn(
                "font-label min-w-0 underline-offset-3 hover:text-highlight hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                stops ? "truncate text-[0.8rem] leading-[1.15] text-foreground" : "truncate text-[0.7rem] leading-[1.1] text-highlight",
              )}
            >
              {g.title}
            </Link>
          </li>
        ))}
      </ul>
      {shown < games.length && (
        <Button
          variant="inline-link"
          size="inline"
          aria-expanded={false}
          onClick={() => setOpen(true)}
          className={cn("mt-1", stops ? "ml-4.5" : "ml-3.5")}
        >
          +{games.length - shown} more
        </Button>
      )}
    </div>
  );
}
