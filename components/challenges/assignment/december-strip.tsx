"use client";

import { useEffect, useRef } from "react";
import type { StripTile } from "@/lib/challenges/edition-calendar";
import { cn } from "@/lib/utils";

// The December strip (surface brief challenges-assignment, 4A): a tile per
// day from the draw to the reveal (or the form's month preview), Anton day
// numbers on ink-2. The draw, the pick deadline and the reveal are holly with
// ink type and a holly caption below; while the Edition runs, the days gone
// are holly at 18% and today wears a paper ring. Too narrow for every tile,
// it scrolls sideways with today (or the next key day) brought into view.
export function DecemberStrip({ tiles, label }: { tiles: StripTile[]; label: string }) {
  const scroller = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = scroller.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const target = list.querySelector<HTMLElement>("[data-today]") ?? list.querySelector<HTMLElement>("[data-key]");
    if (target) list.scrollLeft = target.offsetLeft - list.clientWidth / 2 + target.clientWidth / 2;
  }, [tiles]);
  return (
    <ol
      ref={scroller}
      aria-label={label}
      className="flex snap-x gap-[3px] overflow-x-auto pb-5 [scrollbar-width:thin] md:grid md:grid-flow-col md:auto-cols-fr md:overflow-visible"
    >
      {tiles.map((tile) =>
        tile.kind === "gap" ? (
          <li
            key={tile.date}
            aria-label={`${tile.days} more days`}
            className="font-label grid h-[34px] min-w-8 shrink-0 place-items-center text-[0.8rem] text-faint-foreground"
          >
            …
          </li>
        ) : (
          <li
            key={tile.date}
            data-today={tile.today || undefined}
            data-key={tile.key || undefined}
            aria-current={tile.today ? "date" : undefined}
            className={cn(
              "font-headline relative grid h-[34px] min-w-8 shrink-0 snap-center place-items-center rounded-xs text-[0.875rem] leading-none",
              tile.key
                ? "bg-holly text-background"
                : tile.past
                  ? "bg-holly/18 text-dim-foreground"
                  : "bg-card text-faint-foreground",
              tile.today && !tile.key && "bg-muted text-foreground",
              tile.today && "shadow-[inset_0_0_0_2px_var(--color-foreground)]",
            )}
          >
            {tile.day}
            {tile.key && (
              <span className="font-label absolute top-[38px] left-1/2 -translate-x-1/2 text-[0.69rem] leading-none font-extrabold tracking-[0.06em] whitespace-nowrap text-holly">
                {tile.key}
              </span>
            )}
          </li>
        ),
      )}
    </ol>
  );
}
