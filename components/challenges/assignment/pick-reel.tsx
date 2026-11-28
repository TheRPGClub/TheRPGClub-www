"use client";

import { useEffect, useRef } from "react";
import type { PickCard } from "@/lib/challenges/santa-pick";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

// The reel under the pick card (surface brief challenges-santa-pick, 6C):
// every eligible game as a small cover under a tinsel rule, unseen ones
// faint, seen ones nearly full, the one showing larger in the yellow ring,
// and a holly dot over the picked one. It is a listbox: tapping a cover deals
// it; with the reel focused ← → move, Home/End jump and Enter picks (the
// keys live in usePickDeal). It scrolls sideways to keep the current cover
// in view.
export function PickReel({
  cards,
  index,
  seen,
  pickedId,
  label,
  onJump,
}: {
  cards: readonly PickCard[];
  index: number;
  seen: ReadonlySet<number>;
  pickedId: number | null;
  label: string;
  onJump: (index: number) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = scroller.current;
    const item = box?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!box || !item) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({
      left: item.offsetLeft - box.clientWidth / 2 + item.clientWidth / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  }, [index]);

  return (
    <div data-slot="pick-reel" className="mt-5">
      <div aria-hidden data-slot="pick-reel-rule" className="h-0.5 bg-tinsel/60" />
      <div
        ref={scroller}
        role="listbox"
        aria-label={label}
        aria-orientation="horizontal"
        aria-activedescendant={`pick-reel-${index}`}
        tabIndex={0}
        className="relative flex items-end gap-2.5 overflow-x-auto px-1.5 pt-5 pb-2 outline-none [scrollbar-color:var(--color-border-strong)_transparent] [scrollbar-width:thin] focus-visible:shadow-[inset_0_0_0_2px_var(--color-highlight)]"
      >
        {cards.map((card, i) => {
          const on = i === index;
          return (
            <div
              key={card.gameId}
              id={`pick-reel-${i}`}
              data-index={i}
              role="option"
              aria-selected={on}
              aria-label={card.gameId === pickedId ? `${card.title} (picked)` : card.title}
              onClick={() => onJump(i)}
              className={cn(
                "relative shrink-0 cursor-pointer",
                card.gameId === pickedId &&
                  "after:absolute after:-top-3.5 after:left-1/2 after:size-[9px] after:-translate-x-1/2 after:rounded-full after:bg-holly",
              )}
            >
              <GameCover
                title={card.title}
                coverUrl={card.coverUrl}
                className={cn(
                  "transition-opacity duration-200",
                  on
                    ? "w-[74px] outline-3 outline-offset-3 outline-highlight"
                    : cn("w-16 hover:opacity-100", seen.has(i) ? "opacity-85" : "opacity-55"),
                )}
                fallbackClassName="p-1 text-[0.6rem]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
