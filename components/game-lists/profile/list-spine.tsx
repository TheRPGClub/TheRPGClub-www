"use client";

import { Lock } from "lucide-react";
import type { GameList } from "@/lib/game-lists/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";

// A Game List as a box set on the profile's shelf (pick 4A): a fat spine as
// wide as the list is long, its first cover at the head, the name set
// sideways, and the count and order at the foot. Bindings take turns in
// the page's own inks; a Private list is a dashed spine on the ground.
// Picking one lifts it and opens its pull-out under the shelf.

const BINDINGS = [
  "bg-foreground text-background",
  "bg-muted text-foreground shadow-[inset_0_0_0_1px_rgb(244_244_240/0.12),inset_-6px_0_10px_-6px_rgb(0_0_0/0.5)]",
  "bg-border-strong text-foreground shadow-[inset_-6px_0_10px_-6px_rgb(0_0_0/0.5)]",
];
const SHORT_SORT = { ranked: "Ranked", alphabetical: "A to Z", added: "Added" } as const;

export function spineSize(list: Pick<GameList, "id" | "entry_count">): { width: number; height: number } {
  return { width: Math.min(108, 64 + Math.round(list.entry_count * 1.6)), height: 230 + ((list.id * 37) % 26) };
}

export function ListSpine({ list, index, picked, onPick }: { list: GameList; index: number; picked: boolean; onPick: () => void }) {
  const priv = list.visibility === "private";
  const { width, height } = spineSize(list);
  const first = list.preview_games[0];
  return (
    <Button
      variant="pool-tile"
      size="bare"
      aria-pressed={picked}
      aria-label={`${list.name}, ${list.entry_count} games${priv ? ", Private" : ""}`}
      onClick={onPick}
      style={{ width, height }}
      className="relative shrink-0 self-end motion-safe:transition-transform motion-safe:duration-200 aria-pressed:-translate-y-5 max-sm:scale-90 max-sm:origin-bottom"
    >
      <span
        className={cn(
          "flex size-full flex-col items-center gap-2 rounded-t-sm px-0 pt-3 pb-2.5",
          priv ? "bg-background text-dim-foreground shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]" : BINDINGS[index % BINDINGS.length],
          picked && "shadow-[inset_0_0_0_2px_var(--color-highlight),0_14px_28px_rgb(0_0_0/0.55)]",
        )}
      >
        {priv && (
          <>
            <span aria-hidden className="pointer-events-none absolute inset-1 rounded-t-xs border border-b-0 border-dashed border-border-strong" />
            <span className="font-label absolute -top-2.5 left-1/2 z-[1] inline-flex -translate-x-1/2 -rotate-4 items-center gap-0.5 rounded-xs bg-foreground px-1.5 pt-1 pb-0.5 text-[0.66rem] font-extrabold tracking-[0.07em] whitespace-nowrap text-background">
              <Lock aria-hidden className="size-2.5" />
              Private
            </span>
          </>
        )}
        {first && <GameCover title={first.title} coverUrl={first.cover_url} className="w-9 rounded-[1.6px]" fallbackClassName="hidden" />}
        <span className="font-headline min-h-0 flex-1 overflow-hidden text-[1.2rem] leading-none text-ellipsis whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
          {list.name}
        </span>
        <span aria-hidden className="h-px w-[70%] bg-current opacity-60" />
        <span className="font-headline text-[1.35rem] leading-[0.9]">
          {list.entry_count}
          <small className="font-label mt-0.5 block text-center text-[0.6rem] font-extrabold tracking-[0.08em] opacity-80">
            {SHORT_SORT[list.sort]}
          </small>
        </span>
      </span>
    </Button>
  );
}
